const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");



const deleteProduct = asyncHandler(async(req, res)=>{
    await productService.deleteProduct(req.params.id)

    res.status(200).json({
        success: true,
        message: "Məhsul sistemdən silindi"
    })
})

const updateProduct = asyncHandler(async(req,res)=>{
    const product = await productService.updateProduct(req.params.id, req.body)

    res.status(200).json({
        success: true,
        message: "Məhsulun məlumatları yeniləndi",
        data: product
    })
})

const getProductById = asyncHandler(async(req, res)=>{
    const product = await productService.getProductById(req.params.id)

    res.status(200).json({
        success: true,
        data: product
    })
})

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
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}