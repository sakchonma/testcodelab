"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
});
const Product = mongoose_1.default.model('Product', ProductSchema);
exports.default = Product;
