const User = require("../models/User.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const config = require("../config/env");
const { generateRefreshToken, hashRefreshToken } = require("../utils/refreshToken");
const RefreshToken = require("../models/RefreshToken.model");

async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail
    }).select("+password");

    if (!user) {
       throw new AppError("E-poçt və ya şifrə yanlışdır", 401)
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new AppError("E-poçt və ya şifrə yanlışdır",401);
    }

    if(!user.isActive){
        throw new AppError("Bu hesab aktiv deyil",403);
    }

    const accessToken = jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role
        },
        config.jwtAccessSecret,
        {
            expiresIn: config.jwtAccessSecretExpiresIn,
            issuer: "ecommerce-api-zero",
            audience: "ecommerce-client"
        }
    );

    const refreshToken = generateRefreshToken();

    const tokenHash = hashRefreshToken(refreshToken)

    const expiresAt = new Date(
        Date.now() + config.refreshTokenExpiresDays*24*60*60*1000
    )

    await RefreshToken.create({
        user: user._id,
        tokenHash,
        expiresAt
    })



    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: config.jwtAccessSecretExpiresIn
    };
}



async function registerUser({name, email, password}) {
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({email: normalizedEmail})

    if(existingUser){
       throw new AppError("Bu e-poçt ünvanı artıq qeydiyyatdan keçib", 409)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    try {
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        })
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    } catch (error) {
        if(error.code === 11000){
            throw new AppError("Bu e-poçt ünvanı artıq qeydiyyatdan keçib",409)
        }

        throw error
    }

}

module.exports = {
    registerUser,
    loginUser
}