const express = require("express")
const { register, login, getMe, refresh, logout } = require("../controllers/auth.controller")
const validateRegister = require("../middleware/validateRegister")
const validateLogin = require("../middleware/validateLogin")
const protect = require("../middleware/protect")

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/me", protect, getMe)
router.post("/refresh", refresh)
router.post("/logout", logout)

module.exports = router