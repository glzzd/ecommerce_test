const Product = require("../models/Product");
const AppError = require("../utils/AppError");

function generateSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/İ/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function deleteProduct(id){
    const product = await Product.findByIdAndDelete(id)

    if(!product){
        throw new AppError("Məhsul tapılmadı", 404)
    }

    return product
}

async function updateProduct(id, data) {
    const allowedFields = [
        "name",
        "slug",
        "description",
        "price",
        "compareAtPrice",
        "sku",
        "stock",
        "category",
        "images",
        "status",
        "category"
    ]

    const updates = {}

    for(const field of allowedFields){
        if(Object.prototype.hasOwnProperty.call(data, field)){
            updates[field] = data[field]
        }
    }

    if(updates.name && !updates.slug){
        updates.slug = generateSlug(updates.name)
    } else if(updates.slug){
        updates.slug = generateSlug(updates.slug)
    }


    const product = await Product.findByIdAndUpdate(id, {$set: updates},{new: true, runValidators:true})

    if(!product){
        throw new AppError("Məhsul tapılmadı", 404)
    }
    return product
}

async function getProductById(id) {
    const product = await Product.findById(id).lean()
    if(!product){
        throw new AppError("Məhsul tapılmadı", 404)
    }

    return product
}


async function createProduct(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Məhsullar array formatında göndərilməlidir");
    }

    const products = data.map((item) => {
        if (!item.name || typeof item.name !== "string") {
            throw new Error("Hər məhsul üçün name tələb olunur");
        }

        return {
            ...item,
            slug: generateSlug(item.slug || item.name),
            category: item.category || null
        };
    });

    return await Product.insertMany(products);
}

async function getProducts() {
    return await Product.find()
        .sort({ createdAt: -1 })
        .lean();
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
}