const express = require("express")
const { register, login, getMe, refresh, logout } = require("../controllers/auth.controller")
const validateRegister = require("../middleware/validateRegister")
const validateLogin = require("../middleware/validateLogin")
const protect = require("../middleware/protect")
const authorize = require("../middleware/authorize")

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/me", protect, getMe)
router.post("/refresh", refresh)
router.post("/logout", logout)

router.get("/admin-test", protect, authorize("admin"), (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Admin əməliyyatına icazə verildi",
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        }
    })
})

module.exports = router