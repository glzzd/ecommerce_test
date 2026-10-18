const config = require("../config/env");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer")
  ) {
    throw new AppError("Autentifikasiya tələb olunur", 401);
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    throw new AppError("Access token təqdim edilməyib", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtAccessSecret, {
      algorithms: ["HS256"],
      issuer: "ecommerce-api-zero",
      audience: "ecommerce-client",
    });
  } catch (error) {
      console.error("JWT error:", error.name, error.message);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      throw new AppError("Access token etibarsızdır və ya müddəti bitib", 401);
    }

    throw error;
  }

  if(typeof decoded.sub !== "string"){
    throw new AppError("Access token etibarsızdır", 401)
  }

  const user = await User.findById(decoded.sub).select("_id name email role isActive");

  if(!user || !user.isActive){
    throw new AppError("Belə bir istifadəçi hesabı tapılmadı və ya aktiv deyil", 401)
  }

  req.user = user

  next()


});

module.exports = protect