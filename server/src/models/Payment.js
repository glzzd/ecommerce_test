
const mongoose = require("mongoose")
const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency:{
            type: String,
            required: true,
            uppercase: true,
            default: "AZN"
        },
        provider: {
            type: String,
            required: true,
            enum: ["stripe", "other", "mock"],
        },
        providerPaymentId: {
            type: String,
            default: null,
        },
        idempotencyKey: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "processing", "succeeded", "failed", "cancelled", "refunded"],
            default: "pending",
            index: true,
        },
        failureReason: {
            type: String,
            default: null,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        providerResponse: {
            type: mongoose.Schema.Types.Mixed,
            select: false,
        }

    }, {timestamps: true, versionKey: false})


    //  Eyni istifadecinin eyni idempotencyKey ile tekrar payment yaratmasini qadağan 
    // edir. Bu, eyni sifaris ucun birdən çox payment yaratmaqdan qoruyur.
    paymentSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });

    // Provayderin payment id-si varsa, eyni provayderin eyni payment id-si ile tekrar payment yaratmasini qadağan edir.
    paymentSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, partialFilterExpression: { providerPaymentId: { $type: "string" } } });

module.exports = mongoose.model("Payment", paymentSchema);