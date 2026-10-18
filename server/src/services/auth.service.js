const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const config = require("../config/env");
const {
  generateRefreshToken,
  hashRefreshToken,
} = require("../utils/refreshToken");
const RefreshToken = require("../models/RefreshToken.model");


async function revokeRefreshToken(rawToken) {
    if(typeof rawToken !== "string" || rawToken.length===0){
        return
    }

    const tokenHash = hashRefreshToken(rawToken)
    await RefreshToken.updateOne(
        {
            tokenHash,
            revokedAt: null
        },
        {$set:{
            revokedAt: new Date()
        }}
    )
}

async function refreshAccessToken(rawToken) {
  if (typeof rawToken !== "string" || !rawToken) {
    throw new AppError("Refresh token təqdim edilməyib", 401);
  }

  const tokenHash = hashRefreshToken(rawToken);

  const session = await RefreshToken.findOne({ tokenHash }).select(
    "+tokenHash",
  );

  if (!session) {
    throw new AppError("Refresh token etibarsızdır", 401);
  }

  if (session.revokedAt || session.expiresAt <= new Date()) {
    throw new AppError("Refresh token etibarsızdır və ya vaxtı bitib", 401);
  }

  const user = await User.findById(session.user).select(
    "_id name email role isActive",
  );

  if (!user || !user.isActive) {
    throw new AppError("İstifadəçi aktiv deyil", 401);
  }

  const now = new Date();

  const revokedSession = await RefreshToken.findOneAndUpdate(
    {
      _id: session._id,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        revokedAt: now,
      },
    },
    {
      new: true,
    },
  );

  if (!revokedSession) {
    throw new AppError("Refresh token artıq istifadə edilib", 401);
  }

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    config.jwtAccessSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
      issuer: "ecommerce-api-zero",
      audience: "ecommerce-client",
    },
  );

  const refreshToken = generateRefreshToken();

  const newTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + config.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.jwtAccessExpiresIn,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new AppError("E-poçt və ya şifrə yanlışdır", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError("E-poçt və ya şifrə yanlışdır", 401);
  }

  if (!user.isActive) {
    throw new AppError("Bu hesab aktiv deyil", 403);
  }

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    config.jwtAccessSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
      algorithm: "HS256",
      issuer: "ecommerce-api-zero",
      audience: "ecommerce-client",
    },
  );

  const refreshToken = generateRefreshToken();

  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + config.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.jwtAccessExpiresIn,
  };
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("Bu e-poçt ünvanı artıq qeydiyyatdan keçib", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Bu e-poçt ünvanı artıq qeydiyyatdan keçib", 409);
    }

    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  revokeRefreshToken
};
