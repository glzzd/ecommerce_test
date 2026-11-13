const mongoose = require("mongoose")

const reservationItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }, {_id: false}

    
)


const inventoryReservationSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        items: {
            type: [reservationItemSchema],
            required: true
        },

        status: {
            type: String,
            enum: ["active", "confirmed", "released", "expired"],
            default: "active",
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        confirmedAt: Date,
        releasedAt: Date



    }, {timestamps: true}

)


inventoryReservationSchema.index({status: 1, expiresAt: 1})

module.exports = mongoose.model("InventoryReservation", inventoryReservationSchema)