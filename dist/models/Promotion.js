"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const PromotionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    discountType: {
        type: String,
        enum: ["PERCENT", "AMOUNT"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isFlashSale: {
        type: Boolean,
        default: false
    },
    flashSaleStart: Date,
    flashSaleEnd: Date,
    isActive: {
        type: Boolean,
        default: false
    },
    scopes: [
        {
            scopeType: { type: String, enum: ["PRODUCT", "CATEGORY", "ALL"], required: true },
            refId: { type: mongoose_1.default.Schema.Types.ObjectId, required: false }
        }
    ],
    createAt: {
        type: Date,
        default: Date.now
    },
});
const Promotion = mongoose_1.default.model('Promotion', PromotionSchema);
exports.default = Promotion;
