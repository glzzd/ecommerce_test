const express = require("express")

const app = express()

app.use(express.json())


app.get("/api/health", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "API işləkdir!"
    })
})



// app.post("/api/test", (req, res)=>{
//     res.status(200).json({
//         success: true,
//         body: req.body
//     })
// })

module.exports = app