const express = require("express")
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize")
const { getProducts, createProduct } = require("../controllers/product.controller")

const router = express.Router()

router.get("/", getProducts)
router.post("/", protect,authorize("admin"), createProduct)

module.exports = router