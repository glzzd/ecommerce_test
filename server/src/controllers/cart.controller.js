const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cart.service");

const getCart = asyncHandler(async (req, res)=>{
    const cart = await cartService.getCart(req.user._id)
    res.status(200).json({
        success: true,
        data: cart
    })
})

const addItem = asyncHandler(async (req, res)=>{
    const {productId, quantity} = req.body 

    const cart = await cartService.addItem(req.user._id, productId, quantity)

    res.status(200).json({
        success: true,
        message: "Məhsul səbətə əlavə edildi",
        data: cart
    })
})


const updateItemQuantity = asyncHandler(async (req, res)=>{
    const {quantity} = req.body

    const cart = await cartService.updateItemQuantity(req.user._id, req.params.productId, quantity)
    
    res.status(200).json({
        success: true,
        message: "Məhsul miqdarı yeniləndi",
        data: cart
    })
})


const removeItem = asyncHandler(async (req, res)=>{
    const cart = await cartService.removeItem(req.user._id, req.params.productId)

    res.status(200).json({
        success: true,
        message: "Məhsul səbətdən silindi",
        data: cart
    })
})


const clearCart = asyncHandler(async (req, res)=>{
     const cart = await cartService.clearCart(req.user._id)

    res.status(200).json({
        success: true,
        message: "Səbət təmizləndi",
        data: cart
    })
})

module.exports = {
    getCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
}