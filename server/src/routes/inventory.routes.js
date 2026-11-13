const express = require('express');
const protect = require('../middleware/protect');
const requirePermission = require('../middleware/requirePermission');
const inventoryController = require("../controllers/inventory.controller")

const router = express.Router();

// Butun sifaris route-lari ucun login olma teleb olunur
router.use(protect);

router.patch("/:productId/add", requirePermission("inventory:manage"), inventoryController.addStock);
router.patch("/:productId/adjust", requirePermission("inventory:manage"), inventoryController.adjustStock);

module.exports = router;