const dotenv = require("dotenv")

dotenv.config();

const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 3000,
    mongoUrl: process.env.MONGO_URL
}

if(!config.mongoUrl){
    throw new Error("MONGO_URL .env faylında təyin edilməyib!")
}

module.exports = config