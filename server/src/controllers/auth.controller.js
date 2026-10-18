const { registerUser, refreshAccessToken, revokeRefreshToken } = require("../services/auth.service");
const { loginUser } = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { getRefreshCookieOptions } = require("../utils/authCookie");


const logout = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies?.refreshToken

    if(refreshToken){
        await revokeRefreshToken(refreshToken)
    }

    res.clearCookie(
        "refreshToken",
        getRefreshCookieOptions()
    )

    return res.status(200).json({
        success: true,
        message: "Təhlükəsiz şəkildə çıxış edildi"
    })
})

const refresh = asyncHandler(async(req,res)=>{
    const rawToken = req.cookies?.refreshToken

    const result = await refreshAccessToken(rawToken)

    res.cookie("refreshToken", result.refreshToken, getRefreshCookieOptions())

    return res.status(200).json({
        success: true,
        message: "Token uğurla yeniləndi",
        data:{
            accessToken: result.accessToken,
            tokenType: result.tokenType,
            expiresIn: result.expiresIn
        }
    })
})

const getMe = asyncHandler(async(req,res)=>{
    return res.status(200).json({
        success:true,
        data: {
            user:{
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    })
})

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
    login,
    getMe,
    refresh,
    logout
}