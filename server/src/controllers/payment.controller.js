
const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');


const createPayment = asyncHandler(async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];

    const payment = await paymentService.createPayment(
        {
        userId: req.user._id,
        orderId: req.body.orderId,
        idempotencyKey
    }
    )

    res.status(201).json({
        success: true,
        message: 'Ödəniş uğurla yaradıldı',
        data: {payment}
    });

})


module.exports = {
    createPayment
};