
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const MockPaymentProvider = require("../providers/mockPaymentProvider");

const provider = new MockPaymentProvider();

async function createPayment({ userId, orderId, idempotencyKey }) {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Order ID yanlışdır", 400);
    }

    if (
        typeof idempotencyKey !== "string" ||
        idempotencyKey.trim().length < 8 ||
        idempotencyKey.length > 128
    ) {
        throw new AppError("Düzgün idempotency key tələb olunur", 400);
    }

    const order = await Order.findOne({
        _id: orderId,
        user: userId
    });

    if (!order) {
        throw new AppError("Sifariş tapılmadı", 404);
    }

    if (order.status === "cancelled") {
        throw new AppError(
            "Ləğv edilmiş sifariş ödənilə bilməz",
            409
        );
    }

    if (order.paymentStatus === "paid") {
        throw new AppError(
            "Bu sifariş artıq ödənilib",
            409
        );
    }

    if (!Number.isFinite(order.total) || order.total <= 0) {
        throw new AppError(
            "Sifariş məbləği düzgün deyil",
            400
        );
    }

    const existingPayment = await Payment.findOne({
        user: userId,
        idempotencyKey: idempotencyKey.trim()
    });

    if (existingPayment) {
        if (!existingPayment.order.equals(order._id)) {
            throw new AppError(
                "Idempotency key artıq başqa sifariş üçün istifadə olunub",
                409
            );
        }

        return existingPayment;
    }

    const payment = await Payment.create({
        user: userId,
        order: order._id,
        amount: order.total,
        currency: "AZN",
        provider: "mock",
        status: "pending",
        idempotencyKey: idempotencyKey.trim()
    });

    try {
        const providerResult = await provider.createPayment({
            paymentId: payment._id.toString(),
            amount: payment.amount,
            currency: payment.currency
        });

        if (
            !providerResult ||
            !["processing", "pending"].includes(providerResult.status) ||
            !providerResult.providerPaymentId
        ) {
            throw new Error("Payment provider cavabı yanlışdır");
        }

        payment.providerPaymentId =
            providerResult.providerPaymentId;

        payment.status = providerResult.status;

        await payment.save();

        return payment;

    } catch (error) {
        payment.status = "failed";
        payment.failureReason =
            "Payment provider error: " + error.message;

        await payment.save();

        throw new AppError(
            "Ödəniş prosesi zamanı xəta baş verdi",
            500
        );
    }
}

module.exports = {
    createPayment
};
