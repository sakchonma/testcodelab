import mongoose from "mongoose";
const { Schema } = mongoose;

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
            refId: { type: mongoose.Schema.Types.ObjectId, required: false }
        }
    ],
    createAt: {
        type: Date,
        default: Date.now
    },
});

const Promotion = mongoose.model('Promotion', PromotionSchema);
export default Promotion;
