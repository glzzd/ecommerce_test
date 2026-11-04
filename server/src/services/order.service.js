const { default: mongoose } = require("mongoose");
const { redisClient } = require("../config/redis");
const AppError = require("../utils/AppError");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("node:crypto");

const ACTIVE_PRODUCT_STATUS = "active";

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
}

function getCartCacheKey(userId) {
  return `cart:${userId}`;
}

async function invalidateCartCache(userId) {
  try {
    if (redisClient.isReady) {
      await redisClient.del(getCartCacheKey(userId));
    }
  } catch (error) {
    console.error("Cart cache temizlenmedi: ", error.message);
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function generateOrderNumber() {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `ORD-${Date.now()}-${randomPart}`;
}


function validateShippingAddress(address) {
  const requiredFields = [
    "fullName",
    "phone",
    "country",
    "city",
    "addressLine",
  ];

  if (!address || typeof address !== "object") {
    throw new AppError("Çatdırılma ünvanı tələb olunur", 400);
  }

  for (const field of requiredFields) {
    if (
      typeof address[field] !== "string" ||
      !address[field].trim()
    ) {
      throw new AppError(
        `${field} sahəsi mütləq doldurulmalıdır`,
        400
      );
    }
  }

  return {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    country: address.country.trim(),
    city: address.city.trim(),
    addressLine: address.addressLine.trim(),
    postalCode:
      typeof address.postalCode === "string"
        ? address.postalCode.trim()
        : "",
  };
}





async function checkout(userId, addressInput) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("İstifadəçi İD-si yanlışdır", 400);
  }

  const shippingAddress = validateShippingAddress(addressInput);
  const session = await mongoose.startSession();

  let createdOrder;

  try {
    await session.withTransaction(async () => {
      // 1. Sebeti MongoDB-den oxuyuruq
      const cart = await Cart.findOne({ user: userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new AppError("Sebet bosdur", 400);
      }

      const orderItems = [];
      let subTotal = 0;

      // 2. Her mehsulun cari qiymetini ve stokunu yoxluyuruq
      for (const cartItem of cart.items) {
        const product = await Product.findOne({
          _id: cartItem.product,
          status: ACTIVE_PRODUCT_STATUS,
        }).session(session);

        if (!product) {
          throw new AppError(
            "Səbətdə artıq mövcud olmayan və ya aktiv olmayan məhsul var",
            409,
          );
        }

        const quantity = cartItem.quantity;

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new AppError("Səbətdə düzgün olmayan məhsul miqdarı var", 400);
        }

        if (product.stock < quantity) {
          throw new AppError(
            `${product.name} məhsulu üçün kifayət qədər stok yoxdur`,
            409,
          );
        }

        if (!Number.isFinite(product.price) || product.price < 0) {
          throw new AppError(
            `${product.name} məhsulunun qiyməti yanlışdır`,
            500,
          );
        }

        const unitPrice = roundMoney(product.price);
        const lineTotal = roundMoney(unitPrice * quantity);
        subTotal = roundMoney(subTotal + lineTotal);

        orderItems.push({
          product: product._id,
          name: product.name,
          sku: product.sku || "",
          image:
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : "",
          unitPrice,
          quantity,
          lineTotal,
        });
      }

      // 3. Stoku şərtli, atomik yeniləmə ilə azaldırıq
      // Stok checkout zamanı dəyişibsə, əməliyyat uğursuz olacaq
      for (const item of orderItems) {
        const stockUpdate = await Product.updateOne(
          {
            _id: item.product,
            status: ACTIVE_PRODUCT_STATUS,
            stock: { $gte: item.quantity },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          { session },
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new AppError(
            `${item.name} üçün stok dəyişib. Səbəti yenidən yoxla`,
            409,
          );
        }
      }

      // 4. Mebleg yalniz server terefinden hesablanmalidir
      const shippingFee = 0;
      const tax = 0;
      const discount = 0;

      const total = roundMoney(subTotal + shippingFee + tax - discount);

      // 5. Sifaris senedini yaradiriq
      const orders = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            user: userId,
            items: orderItems,
            shippingAddress,
            subTotal,
            shippingFee,
            tax,
            discount,
            total,
            status: "pending",
            paymentStatus: "unpaid",
          },
        ],
        { session },
      );

      createdOrder = orders[0];

      // 6. Sifaris ugurludursa sebetimizi bosaldiriq
      const cartUpdate = await Cart.updateOne(
        {
          _id: cart._id,
          user: userId,
        },
        {
          $set: {
            items: [],
          },
        },
        {
          session,
        },
      );

      if (cartUpdate.modifiedCount !== 1) {
        throw new AppError("Sebet yenilenmedi, sifaris tamamlanmadi", 409);
      }
    });

    // withTransaction ugurla tamamlanandan sonra cache temizlenir

    await invalidateCartCache(userId);
    return createdOrder;
  } finally {
    await session.endSession();
  }
}

async function getMyOrders(userId, query={}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(50, Number.parseInt(query.limit, 10) || 10)
  const filter = {user: userId};

  if(query.status){
    const allowedStatus = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ]

    if(!allowedStatus.includes(query.status)){
      throw new AppError("Sifariş statusu yanlışdır", 400)
    }

    filter.status = query.status
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).toSorted({createdAt: -1}).skip((page-1)*limit).limit(limit).lean(),
    Order.countDocuments(filter)
  ])

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total/limit)

    }
  }

}

async function cancelMyOrder(userId, orderId) {
  if(!mongoose.isValidObjectId(orderId)){
    throw new AppError("Sifariş İD-si yanlışdır", 400)
  }

  const session = await mongoose.startSession();

  try {
    let cancelledOrder;
    await session.withTransaction(async()=>{
      const order = await Order.findOne({
        _id: orderId,
        user: userId
      }).session(session)

      if(!order){
        throw new AppError("Sifariş tapılmadı", 404)
      }

      // Yalnız pending statusunda olan sifarişlər MÜŞTƏRİ TƏRƏFİNDƏN ləğv edilə bilər
      if(order.status !== "pending"){
        throw new AppError("Bu statusda olan sifariş ləğv edilə bilməz", 400)
      }

      if(order.paymentStatus === "paid"){
        throw new AppError("Ödəniş edilmiş sifariş üçün REFUND prosesi tələb olunur", 409)
      }

      // Stoku geri qaytaririq
      for(const item of order.items){
        const stockRestore = await Product.updateOne(
          {_id: item.product},
          {$inc: {stock: item.quantity}},
          {session}
        )

        if(stockRestore.matchedCount !==1){
          throw new AppError("Məhsul stokda bərpa edilmədi", 409)
        }
      }

      order.status = "cancelled"
      order.cancelledAt = new Date()

      await order.save({session})

      cancelledOrder = order
    })

    return cancelledOrder

  } finally {
    await session.endSession()
  }
}

async function updateOrderStatus(orderId, nextStatus) {
  if(!mongoose.isValidObjectId(orderId)){
    throw new AppError("Sifariş= İD-si yanlışdır", 400)
  }

  const allowedStatuses = Object.keys(ALLOWED_TRANSITIONS)

  if(!allowedStatuses.includes(nextStatus)){
    throw new AppError("Yeni status yanlışdır", 400)
  }

  const session = await mongoose.startSession()

  try {
    let updatedOrder

    await session.withTransaction(async()=>{
       const order = await Order.findById(orderId).session(session)

       if(!order){
        throw new AppError("Sifariş tapılmadı", 404)
        
       }
       
       const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status]

       if(!allowedNextStatuses.includes(nextStatus)){
        throw new AppError(`Sifariş ${order.status} statusundan ${nextStatus} statusuna keçirilə bilməz`, 409)
       }

      //  Admin ləğv edərsə
      if(nextStatus === "cancelled" && order.paymentStatus === "paid"){
        throw new AppError("Ödəniş edilmiş sifariş REFUND prosesi olmadan ləğv edilə bilməz", 409)
      }

      // Stok ancaq sifaris heqiqeten legv olunursa geri qaytarılır
      if(nextStatus==="cancelled"){
        for(const item of order.items){
          const stockRestore = await Product.updateOne(
            {_id: item.product},
            {$inc: {stock: item.quantity}},
            {session}
          )

          if(stockRestore.matchedCount !==1){
            throw new AppError("Məhsul stoku bərpa edilə bilmədi", 409)
          }
        }

        if(nextStatus === "delivered"){
          order.deliveredAt = new Date()
        }

        order.status = nextStatus

        await order.save({session})

        updateOrder = order


      }

      return updatedOrder
    })
  } finally {
    await session.endSession()
  }
}


module.exports={
  checkout,
  getMyOrders,
  cancelMyOrder,
  updateOrderStatus
}