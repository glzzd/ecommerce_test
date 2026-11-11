const express = require("express")
const protect = require("../middleware/protect")
const { getUsers, updateUserRole, setUserActiveStatus } = require("../controllers/adminUser.controller")
const requirePermission = require("../middleware/requirePermission")

const router = express.Router()

router.use(protect)

router.get("/", requirePermission("user:read"), getUsers)
router.patch("/:id/role", requirePermission("user:role:update"), updateUserRole)
router.patch("/:id/active", requirePermission("user:update"), setUserActiveStatus)


module.exports = router