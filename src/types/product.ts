import mongoose from "mongoose"
export interface IProductDetail {
    name: String,
    description: String,
    images: [String],
    categoryId: mongoose.Schema.Types.ObjectId,
    price: Number,
    updatedAt: Date,
    createAt: Date,
};
