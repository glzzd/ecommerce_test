const dotenv = require("dotenv")

dotenv.config();

const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 3000,
    mongoUrl: process.env.MONGO_URL,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtAccessSecretExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7
}

if(!config.mongoUrl){
    throw new Error("MONGO_URL .env faylında təyin edilməyib!")
}

if(!config.jwtAccessSecret || config.jwtAccessSecret.length < 32){
    throw new Error("JWT_ACCESS_SECRET təyin edilməli və ən azı 32 simvol olmalıdır")
}

module.exports = config