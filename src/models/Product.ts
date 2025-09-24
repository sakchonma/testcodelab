import mongoose from "mongoose"
const { Schema } = mongoose

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    images: [{
        type: String
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    price: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createAt: {
        type: Date,
        default: Date.now
    },
})

const Product = mongoose.model('Product', ProductSchema)
export default Product