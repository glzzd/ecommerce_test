const { registerUser } = require("../services/auth.service");
const { loginUser } = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { getRefreshCookieOptions } = require("../utils/authCookie");

const login = asyncHandler(async(req,res)=>{
    const result = await loginUser(req.body)
    res.cookie("refreshToken", result.refreshToken, getRefreshCookieOptions())

    return res.status(200).json({
        success:true,
        message: "Uğurla daxil oldunuz",
        data: {
            user: result.user,
            accessToken: result.accessToken,
            tokenType: result.tokenType,
            expiresIn: result.expiresIn
        }
    })
})

const register = asyncHandler(async(req,res)=>{
    const user = await registerUser(req.body)
    return res.status(201).json({
        success: true,
        message: "Qeydiyyat uğurla tamamlandı",
        data: {
            user
        }
    })
})



module.exports = {
    register,
    login
}