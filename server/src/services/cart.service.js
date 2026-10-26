const Cart = require("../models/Cart")

const {redisClient} = require("../config/redis")
const { default: mongoose } = require("mongoose")
const AppError = require("../utils/AppError")
const Product = require("../models/Product")

const CART_CACHE_TTL = 300

function getCartCacheKey(userId){
    return `cart:${userId}`
}

async function invalidateCartCache(userId) {
    try {
        if(redisClient.isReady){
            await redisClient.del(getCartCacheKey(userId))
        }
    } catch (error) {
        console.error("Cart cache silinmə xətası: ", error.message)
    }
}

async function getOrCreateCart(userId) {
    return Cart.findOneAndUpdate(
        {user: userId},
        {$setOnInsert: {user: userId, items:[]}},
        {upsert: true, new: true, setDefaultsOnInsert: true}
    )
}


function formatCart(cart) {
    const items = cart.items
        .filter((item) => item.product)
        .map((item) => {
            const product = item.product

            return {
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    stock: product.stock
                },
                quantity: item.quantity,
                lineTotal: Number(
                    (product.price * item.quantity).toFixed(2)
                )
            }
        })

    const subTotal = items.reduce(
        (total, item) => total + item.lineTotal,
        0
    )

    return {
        _id: cart._id,
        user: cart.user,
        items: items, // ƏSAS DÜZƏLİŞ
        totalItems: items.reduce(
            (total, item) => total + item.quantity,
            0
        ),
        subTotal: Number(subTotal.toFixed(2)),
        updatedAt: cart.updatedAt
    }
}



async function getCart(userId) {
    const cacheKey = getCartCacheKey(userId)

    // 1. Redis cache yoxlanılır
    try {
        if (redisClient.isReady) {
            const cachedCart = await redisClient.get(cacheKey)

            if (cachedCart) {
                return JSON.parse(cachedCart)
            }
        }
    } catch (error) {
        console.error("Cart cache oxunmadı:", error.message)
    }

    // 2. MongoDB-dən səbət götürülür
    const cart = await getOrCreateCart(userId)

    // 3. Məhsul məlumatları doldurulur
    await cart.populate({
        path: "items.product",
        select: "name price stock images status"
    })

    // 4. Cavab formatlanır
    const result = formatCart(cart)

    // 5. Nəticə Redis-ə yazılır
    try {
        if (redisClient.isReady) {
            await redisClient.set(
                cacheKey,
                JSON.stringify(result),
                { EX: CART_CACHE_TTL }
            )
        }
    } catch (error) {
        console.error("Cart cache yazılmadı:", error.message)
    }

    return result
}


async function addItem(userId, productId, quantity) {
    if(!mongoose.isValidObjectId(productId)){
        throw new AppError("Məhsul İD-si düzgün deyil", 400)
    }
    if(!Number.isInteger(quantity) || quantity<1){
        throw new AppError("Miqdar ən azı 1 olan tam ədəd olmalıdır", 400)
    }

    const product = await Product.findById(productId)

    if(!product || product.status !=="active"){
        throw new AppError("Aktiv məhsul tapılmadı", 404)
    }

    if(product.stock < quantity){
        throw new AppError("Stokda kifayət qədər məhsul yoxdur", 409)
    }

    const cart = await getOrCreateCart(userId)

    const existingItem = cart.items.find((item)=>item.product.toString() === productId)

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity

    if(newQuantity > product.stock){
        throw new AppError(`Maksimum mövcud olan stok sayı: ${product.stock}`, 409)
    }

    if(existingItem){
        existingItem.quantity = newQuantity
    }else {
        cart.items.push({
            product: product._id,
            quantity
        })
    }

    await cart.save()
    await invalidateCartCache(userId)

    return getCart(userId)
}

async function updateItemQuantity(userId, productId, quantity) {
    if(!mongoose.isValidObjectId(productId)){
        throw new AppError("Məhsul İD-si düzgün deyil", 400)
    }
    if(!Number.isInteger(quantity) || quantity<1){
        throw new AppError("Miqdar ən azı 1 olan tam ədəd olmalıdır", 400)
    }

    const product = await Product.findById(productId)

    if(!product || product.status !=="active"){
        throw new AppError("Aktiv məhsul tapılmadı", 404)
    }

    if(product.stock < quantity){
        throw new AppError("Stokda kifayət qədər məhsul yoxdur", 409)
    }

    const cart = await Cart.findOne({user: userId})

    if(!cart){
        throw new AppError("Səbət tapılmadı", 404)
    }

    const item = cart.items.find((entry)=>entry.product.toString() === productId)

    if(!item){
        throw new AppError("Məhsul səbətdə tapılmadı", 404)
    }

    item.quantity = quantity

    await cart.save()
    await invalidateCartCache(userId)

    return getCart(userId)
}

async function removeItem(userId, productId) {
    if(!mongoose.isValidObjectId(productId)){
        throw new AppError("Məhsul İD-si düzgün deyil", 400)
    }

    const cart = await Cart.findOne({user: userId})

    if(!cart){
        throw new AppError("Səbət tapılmadı", 404)
    }

    const originalLength = cart.items.length

    cart.items = cart.items.filter((item)=>item.product.toString() !== productId)
    if(cart.items.length === originalLength){
        throw new AppError("Məhsul səbətdə tapılmadı", 404)
    }

    await cart.save()
    await invalidateCartCache(userId)

    return getCart(userId)
}

async function clearCart(userId) {
    const cart = await getOrCreateCart(userId)

    cart.items = []

    await cart.save()
    await invalidateCartCache(userId)

    return getCart(userId)
}

module.exports = {
    getCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
}