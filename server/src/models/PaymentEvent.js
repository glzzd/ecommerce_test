const mongoose = require("mongoose")

const paymentEventSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            required: true,
        },
        eventId: {
            type: String,
            required: true
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true,
        },
        eventType: {
            type: String,
            required: true
        },
        processedAt: {
            type: Date,
            default: Date.now
        }


    },
    {
        timestamps: true,
        versionKey: false,
    }
)

paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true })

module.exports = mongoose.model("PaymentEvent", paymentEventSchema)