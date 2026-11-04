const express = require('express');
const protect = require('../middleware/protect');
const { createPayment } = require('../controllers/payment.controller');
 
const router = express.Router();

router.use(protect);

router.post("/", createPayment);

module.exports = router;