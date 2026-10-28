const { default: mongoose } = require("mongoose");
const { validate } = require("./User.model");

const orderItemSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required:true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min:1,
        validate: {
            validator: Number.isInteger,
            message: "Miqdar tam ədəd olmalıdır"
        }
    },
    lineTotal: {
        type: Number,
        required: true,
        min: 0
    }
}, {_id:false})

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    addressLine: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        default: ""
    },
}, {_id: false})

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items)=> items.length > 0,
            message: "Sifarişdə ən azı bir məhsul olmalıdır"
        }
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0
    },
    shippingFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default: "pending",
        index: true
    },
    paymentStatus: {
        type: String,
        enum: [
            "unpaid",
            "paid",
            "failed",
            "refunded"
        ],
        default: "unpaid",
        index: true
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
},
{
    timestamps: true,
    versionKey: false
}
)

orderSchema.index({user: 1, createdAt: -1})
orderSchema.index({status: 1, createdAt: -1})

module.exports = mongoose.model("Order", orderSchema)