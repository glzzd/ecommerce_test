const { handlePaymentWebhook } = require("../controllers/paymentWebhook.controller")

const express = require("express")


const router = express.Router()

router.post(
    "/mock",
    express.raw({
        type: "application/json",
        limit: "100kb"
    }), handlePaymentWebhook
)

module.exports = router