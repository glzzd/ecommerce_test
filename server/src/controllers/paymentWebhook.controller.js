const asyncHandler = require("../utils/asyncHandler");
const webhookService = require('../services/paymentWebhook.service');

const handlePaymentWebhook = asyncHandler(async (req,res)=> {
    const signature = req.headers["x-mock-signature"]

    const result = await webhookService.processWebhook(req.body, signature)

    res.status(200).json({
        success: true,
        message: result.duplicate ? "Webhook artiq emal edilib" : result.ignored ? result.message : "Webhook ugurla emal edildi",
        data: result
    })
})

module.exports = {
    handlePaymentWebhook
}