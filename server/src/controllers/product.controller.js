const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");


const createProduct = asyncHandler(async(req,res)=>{
    const product = await productService.createProduct(req.body)
    res.status(201).json({
        success: true,
        message: "Məhsul uğurla əlavə edildi",
        data: product
    })
})

const getProducts = asyncHandler(async(req,res)=>{
    const products = await productService.getProducts()

    res.status(200).json({
        success: true,
        results: products.length,
        data: products
    })
})

module.exports = {
    createProduct,
    getProducts
}