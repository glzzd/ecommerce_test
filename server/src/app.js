const express = require("express")
const authRoutes = require("./routes/auth.routes")

const app = express()

app.use(express.json({limit: "10kb"}))


app.get("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "API işləkdir!"
    })
})

app.use("/api/auth", authRoutes)


// app.post("/api/test", (req, res)=>{
//     res.status(200).json({
//         success: true,
//         body: req.body
//     })
// })

module.exports = app