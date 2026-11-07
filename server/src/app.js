const express = require("express")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth.routes")
const productRoutes = require("./routes/product.routes")
const cartRoutes = require("./routes/cart.routes")
const orderRoutes = require("./routes/order.routes")
const paymentRoutes = require("./routes/payment.routes")
const paymentWebhookRoutes = require("./routes/paymentWebhook.routes")
const notFound = require("./middleware/notFound")
const errorHandler = require("./middleware/errorHandler")


const app = express()

app.use("/api/webhooks", paymentWebhookRoutes)

app.use(express.json({limit: "10kb"}))
app.use(cookieParser())


app.get("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "API işləkdir!"
    })
})

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payments", paymentRoutes)
// Marşrut tapılmadıqda
app.use(notFound)

// Bütün xətalarımız üçün middleware
app.use(errorHandler)

module.exports = app