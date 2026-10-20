const Product = require("../models/Product");

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
    getProducts
}