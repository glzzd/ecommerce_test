const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Məhsul adı tələb olunur"],
        trim: true,
        minlength: [2, "Məhsulun adı minimum 2 simvol olmalıdır"]
    },
    slug: {
        type: String,
        required: [true, "Slug tələb olunur"],
        unique: true,
        trim: true,
        lowercase: true 
    },
    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: [5000, "Açıqlama mətni max 5000 simvol ola bilər"]
    },
    price:{
        type: Number,
        required: [true, "Məhsulun qiyməti tələb olunur"],
        min: [0, "Qiymət mənfi ədəd ola bilməz"]
    },
    compareAtPrice: {
        type: Number,
        min: [0, "Əvvəlki qiymət mənfi ədəd ola bilməz"],
        default: null
    },
    sku: {
        type: String,
        trim: true,
        uppercase: true,
        unique: true
    },
    stock: {
        type: Number,
        min: [0, "Stok mənfi ədəd ola bilməz"],
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: "Stok tam ədəd olmalıdır"
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    images: {
        type: [
            {
                type: String,
                trim: true
            }
        ],
        default: []
    },
    status: {
        type: String,
        enum: ["draft", "active", "archived"],
        default: "draft"
    }
},
{timestamps: true, versionKey: false})

productSchema.index({name: 1})
productSchema.index({category: 1, status: 1})
productSchema.index({price: 1})
productSchema.index({createdAt: -1})

const Product = mongoose.model("Product", productSchema);
module.exports = Product