import mongoose from "mongoose"
const { Schema } = mongoose

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
})

const Category = mongoose.model('Category', CategorySchema)
export default Category