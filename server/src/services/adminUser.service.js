const { default: mongoose } = require("mongoose");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");

const allowedRoles = ["customer", "manager", "admin"];

async function getUsers(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 10),
  );
  const filter = {};

  if (query.role) {
    if (!allowedRoles.includes(query.role)) {
      throw new AppError("Rol duzgun deyil", 400);
    }
    filter.role = query.role;
  }

  if (query.search) {
    const search = String(query.search).trim().slice(0, 100);

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); //regex

      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken -hashToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateUserRole(targetUserId, newRole, actorId) {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw new AppError("Istifadeci ID-si yanlisdir", 400);
  }

  if (!allowedRoles.includes(newRole)) {
    throw new AppError("Rol duzgun deyil", 400);
  }

  if (String(targetUserId) === String(actorId)) {
    throw new AppError(
      "Oz rolunuzu bu endpoint vasitesile deyise bilmezsiniz",
      403,
    );
  }

  const user = await User.findById(targetUserId);

  if (!user) {
    throw new AppError("Istifadeci tapilmadi", 404);
  }

  user.role = newRole;
  await user.save();

  return User.findById(user._id)
    .select("-password -refreshToken -hashToken")
    .lean();
}

async function setUserActiveStatus(targetUserId, isActive, actorId) {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw new AppError("Istifadeci ID-si yanlisdir", 400);
  }

  if(typeof isActive !== "boolean"){
        throw new AppError("isActive deyeri boolean (true/false) olmalidir", 400);
  }

   if (String(targetUserId) === String(actorId)) {
    throw new AppError(
      "Oz hesabinizi bu endpoint vasitesile deaktiv ede bilmezsiniz",
      403,
    );
  }

  const user = await User.findById(targetUserId)

  if(!user){
      throw new AppError("Istifadeci tapilmadi", 404);
  }

  user.isActive = isActive
  await user.save()

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  }

}


module.exports = {
    getUsers,
    updateUserRole,
    setUserActiveStatus
}
