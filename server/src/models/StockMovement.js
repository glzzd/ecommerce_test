const mongoose = require("mongoose")

const stockMovementSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        type: {
           type: String,
           enum: [
            "stock_in",
            "stock_out",
            "reservation",
            "reservation_release",
            "sale",
            "return",
            "adjusment",
           ],
           reqired: true 
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        previousStock: {
            type: Number,
            reqired: true
        },
        newStock: {
            type: Number,
            reqired: true
        },
        previousReservedStock: {
            type: Number,
            reqired: true
        },
        newReservedStock: {
            type: Number,
            reqired: true
        },
        reason: {
            type: String,
            trim: true,
            maxLength: 500
        },
        reference: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
         performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }, {timestamps: true}
)

stockMovementSchema.index({product: 1, createdAt: -1})
stockMovementSchema.index({type: 1, createdAt: -1})

module.exports = mongoose.model("StockMovement", stockMovementSchema)