const express = require("express")
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize")
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller")
const requirePermission = require("../middleware/requirePermission")

const router = express.Router()

router.get("/", getProducts)
router.post("/", protect, requirePermission("product:create"), createProduct)
router.get("/:id", getProductById)
router.patch("/:id", protect, requirePermission("product:update"), updateProduct)
router.delete("/:id", protect,requirePermission("product:delete"), deleteProduct)

module.exports = router