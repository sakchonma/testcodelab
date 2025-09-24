"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveFlashSales = exports.deletePromotion = exports.updatePromotion = exports.createPromotion = exports.getPromotionById = exports.listPromotion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const redis_1 = require("../configs/redis");
const listPromotion = async (page, limit) => {
    try {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `promotion-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: promotion-list-${page}-${limit}`);
            return JSON.parse(cachedData);
        }
        const promotionList = await Promotion_1.default.find({})
            .select({
            name: 1,
            discountType: 1,
            isFlashSale: 1,
            discountValue: 1,
            isActive: 1,
        })
            .skip(skip)
            .limit(limitNumber)
            .sort({ createAt: -1 });
        const totalPromotion = await Promotion_1.default.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalPromotion / limitNumber) : 1;
        await redis.set(cacheKey, JSON.stringify({
            data: promotionList,
            pagination: {
                total: totalPromotion,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            }
        }), 'EX', Math.floor(55));
        return {
            data: promotionList,
            pagination: {
                total: totalPromotion,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.listPromotion = listPromotion;
const getPromotionById = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw new Error("Invalid Promotion ID");
        const promotionId = new mongoose_1.default.Types.ObjectId(id);
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `promotion-${promotionId}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: promotion-${promotionId}`);
            return JSON.parse(cachedData);
        }
        const promotion = await Promotion_1.default.aggregate([
            { $match: { _id: promotionId } },
            { $unwind: { path: "$scopes", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "scopes.refId",
                    foreignField: "_id",
                    as: "productDetail"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "scopes.refId",
                    foreignField: "_id",
                    as: "categoryDetail"
                }
            },
            {
                $addFields: {
                    "scopes.name": {
                        $cond: [
                            { $eq: ["$scopes.scopeType", "PRODUCT"] },
                            { $arrayElemAt: ["$productDetail.name", 0] },
                            {
                                $cond: [
                                    { $eq: ["$scopes.scopeType", "CATEGORY"] },
                                    { $arrayElemAt: ["$categoryDetail.name", 0] },
                                    null
                                ]
                            }
                        ]
                    },
                    "scopes.price": {
                        $cond: [
                            { $eq: ["$scopes.scopeType", "PRODUCT"] },
                            { $arrayElemAt: ["$productDetail.price", 0] },
                            null
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    discountType: { $first: "$discountType" },
                    discountValue: { $first: "$discountValue" },
                    startDate: { $first: "$startDate" },
                    endDate: { $first: "$endDate" },
                    isFlashSale: { $first: "$isFlashSale" },
                    flashSaleStart: { $first: "$flashSaleStart" },
                    flashSaleEnd: { $first: "$flashSaleEnd" },
                    isActive: { $first: "$isActive" },
                    createAt: { $first: "$createAt" },
                    scopes: { $push: "$scopes" }
                }
            }
        ]);
        await redis.set(cacheKey, JSON.stringify({
            data: promotion
        }), 'EX', Math.floor(55));
        if (!promotion.length)
            throw new Error("Promotion not found");
        return { data: promotion };
    }
    catch (error) {
        throw error;
    }
};
exports.getPromotionById = getPromotionById;
const createPromotion = async (data) => {
    try {
        const exists = await Promotion_1.default.findOne({ name: data.name });
        if (exists) {
            return { message: "Promotion name already exists" };
        }
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            return { message: "Start date must be before end date" };
        }
        if (data.isFlashSale) {
            if (!data.flashSaleStart || !data.flashSaleEnd) {
                return { message: "Flash sale start and end dates are required" };
            }
            if (new Date(data.flashSaleStart) >= new Date(data.flashSaleEnd)) {
                return { message: "Flash sale start must be before end" };
            }
            if (data.flashSaleStart < data.startDate || data.flashSaleEnd > data.endDate) {
                return { message: "Flash sale period must be within promotion period" };
            }
        }
        if (data.discountType === "PERCENT" && (data.discountValue <= 0 || data.discountValue > 100)) {
            return { message: "Percent discount must be between 1 and 100" };
        }
        if (data.discountType === "AMOUNT" && data.discountValue <= 0) {
            return { message: "Amount discount must be greater than 0" };
        }
        if (data.scopes && data.scopes.length > 0) {
            for (const scope of data.scopes) {
                if (scope.scopeType === "ALL" && scope.refId) {
                    return { message: "refId should not be provided when scopeType is ALL" };
                }
                if ((scope.scopeType === "PRODUCT" || scope.scopeType === "CATEGORY") && !scope.refId) {
                    return { message: `${scope.scopeType} scope requires a valid refId` };
                }
                if (scope.scopeType === "PRODUCT") {
                    const product = await Product_1.default.findById(scope.refId);
                    if (!product)
                        return { message: `Product ${scope.refId} not found` };
                }
                else if (scope.scopeType === "CATEGORY") {
                    const category = await Category_1.default.findById(scope.refId);
                    if (!category)
                        return { message: `Category ${scope.refId} not found` };
                }
            }
        }
        //ถ้าไม่อยากให้เวลาเปิดโปรโมชั่นชนกันเปิดคอมเม้นนี้ด
        // const overlapping = await PromotionModel.findOne({
        //     $or: [
        //         { startDate: { $lte: data.endDate }, endDate: { $gte: data.startDate } }
        //     ],
        // });
        // if (overlapping) {
        //     return { message: "Another promotion already exists in this period" };
        // }
        const newPromotion = await Promotion_1.default.create({
            ...data,
            isActive: true,
        });
        return { data: newPromotion };
    }
    catch (error) {
        throw error;
    }
};
exports.createPromotion = createPromotion;
const updatePromotion = async (id, data) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return { message: "Invalid Promotion ID" };
        }
        const currentPromotion = await Promotion_1.default.findById(id);
        if (!currentPromotion) {
            return { message: "Promotion not found" };
        }
        if (data.name) {
            const exists = await Promotion_1.default.findOne({
                name: data.name,
                _id: { $ne: id }
            });
            if (exists) {
                return { message: "Promotion name already exists" };
            }
        }
        if (data.startDate && data.endDate) {
            if (new Date(data.startDate) >= new Date(data.endDate)) {
                return { message: "Start date must be before end date" };
            }
        }
        if (data.isFlashSale) {
            if (!data.flashSaleStart || !data.flashSaleEnd) {
                return { message: "Flash sale start and end dates are required" };
            }
            if (new Date(data.flashSaleStart) >= new Date(data.flashSaleEnd)) {
                return { message: "Flash sale start must be before end" };
            }
            const promoStart = data.startDate || currentPromotion.startDate;
            const promoEnd = data.endDate || currentPromotion.endDate;
            if (data.flashSaleStart < promoStart || data.flashSaleEnd > promoEnd) {
                return { message: "Flash sale period must be within promotion period" };
            }
        }
        if (data.discountType && data.discountValue !== undefined) {
            if (data.discountType === "PERCENT" && (data.discountValue <= 0 || data.discountValue > 100)) {
                return { message: "Percent discount must be between 1 and 100" };
            }
            if (data.discountType === "AMOUNT" && data.discountValue <= 0) {
                return { message: "Amount discount must be greater than 0" };
            }
        }
        if (data.scopes && data.scopes.length > 0) {
            for (const scope of data.scopes) {
                if (scope.scopeType === "ALL" && scope.refId) {
                    return { message: "refId should not be provided when scopeType is ALL" };
                }
                if ((scope.scopeType === "PRODUCT" || scope.scopeType === "CATEGORY") && !scope.refId) {
                    return { message: `${scope.scopeType} scope requires a valid refId` };
                }
                if (scope.scopeType === "PRODUCT") {
                    const product = await Product_1.default.findById(scope.refId);
                    if (!product)
                        return { message: `Product ${scope.refId} not found` };
                }
                else if (scope.scopeType === "CATEGORY") {
                    const category = await Category_1.default.findById(scope.refId);
                    if (!category)
                        return { message: `Category ${scope.refId} not found` };
                }
            }
        }
        // const startDate = data.startDate || currentPromotion.startDate;
        // const endDate = data.endDate || currentPromotion.endDate;
        // const overlapping = await PromotionModel.findOne({
        //     _id: { $ne: id }, // ยกเว้นตัวเอง
        //     $or: [
        //         { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        //     ],
        // });
        // if (overlapping) {
        //     return { message: "Another promotion already exists in this period" };
        // }
        const updatedPromotion = await Promotion_1.default.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return { data: updatedPromotion };
    }
    catch (error) {
        throw error;
    }
};
exports.updatePromotion = updatePromotion;
const deletePromotion = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            throw "Invalid Promotion ID";
        const deletedPromotion = await Promotion_1.default.findByIdAndDelete(id);
        if (!deletedPromotion)
            throw "Promotion not found";
        return { data: { status: true } };
    }
    catch (error) {
        throw error;
    }
};
exports.deletePromotion = deletePromotion;
const getActiveFlashSales = async () => {
    try {
        const now = new Date();
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `FlashSales`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: FlashSales`);
            return JSON.parse(cachedData);
        }
        const flashSales = await Promotion_1.default.find({
            isFlashSale: true,
            flashSaleStart: { $lte: now },
            flashSaleEnd: { $gte: now },
        }).select({
            name: 1,
            discountType: 1,
            discountValue: 1,
            startDate: 1,
            endDate: 1,
            flashSaleStart: 1,
            flashSaleEnd: 1,
        });
        await redis.set(cacheKey, JSON.stringify({
            data: flashSales
        }), 'EX', Math.floor(55));
        return { data: flashSales };
    }
    catch (error) {
        throw error;
    }
};
exports.getActiveFlashSales = getActiveFlashSales;
