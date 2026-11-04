const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/order.service");

const checkout = asyncHandler(async (req, res)=>{
    const order = await orderService.checkout(
        req.user._id,
        req.body.shippingAddress
    )

    res.status(201).json({
        success: true,
        message: "Sifariş uğurla yaradıldı",
        order: {order}
    })
})

const getMyOrders = asyncHandler(async (req, res)=>{
    const result = await orderService.getMyOrders(
        req.user._id,
        req.query
    )

    res.status(200).json({
        success: true,
        data: {result}
    })
})

const cancelMyOrder = asyncHandler(async (req, res)=>{
    const order = await orderService.cancelMyOrder(
        req.user._id,
        req.params.id
    )

    res.status(200).json({
        success: true,
        message: "Sifariş ləğv edildi",
        data: {order}
    })
})

const updateOrderStatus = asyncHandler(async (req, res)=>{
    const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status
    )

    res.status(200).json({
        success: true,
        message: "Sifariş statusu yeniləndi",
        data: {order}
    })
})

module.exports={
  checkout,
  getMyOrders,
  cancelMyOrder,
  updateOrderStatus
}