const express = require('express');
const protect = require('../middleware/protect');
const { checkout, getMyOrders, cancelMyOrder, updateOrderStatus } = require('../controllers/order.controller');


const router = express.Router();

// Butun sifaris route-lari ucun login olma teleb olunur
router.use(protect);

// Musteri endpointleri
router.post("/checkout", checkout);
router.get("/my-orders", getMyOrders);
router.patch("/:id/cancel", cancelMyOrder);


// Admin endpointleri
router.patch("/:id/status", updateOrderStatus);

module.exports = router;