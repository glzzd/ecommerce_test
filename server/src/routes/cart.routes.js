const express = require("express")
const protect = require("../middleware/protect")
// const authorize = require("../middleware/authorize")
const { getCart, addItem, updateItemQuantity, removeItem, clearCart } = require("../controllers/cart.controller")

const router = express.Router()

router.use(protect)

router.get("/", getCart)
router.post("/items", addItem)
router.patch("/items/:productId", updateItemQuantity)
router.delete("/items/:productId", removeItem)
router.delete("/", clearCart)



module.exports = router