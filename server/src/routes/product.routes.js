const express = require("express")
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize")
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller")

const router = express.Router()

router.get("/", getProducts)
router.post("/", protect, authorize("admin"), createProduct)
router.get("/:id", getProductById)
router.patch("/:id", protect, authorize("admin"), updateProduct)
router.delete("/:id", protect, authorize("admin"), deleteProduct)

module.exports = router