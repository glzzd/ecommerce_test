const express = require("express")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth.routes")
const notFound = require("./middleware/notFound")
const errorHandler = require("./middleware/errorHandler")


const app = express()

app.use(express.json({limit: "10kb"}))
app.use(cookieParser())


app.get("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "API işləkdir!"
    })
})

app.use("/api/auth", authRoutes)

// Marşrut tapılmadıqda
app.use(notFound)

// Bütün xətalarımız üçün middleware
app.use(errorHandler)

module.exports = app