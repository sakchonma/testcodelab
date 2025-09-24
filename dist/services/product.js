"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.listProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
const redis_1 = require("../configs/redis");
const listProduct = async (page, limit) => {
    try {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `product-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: product-list-${page}-${limit}`);
            return JSON.parse(cachedData);
        }
        const productList = await Product_1.default.aggregate([
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limitNumber
            },
            {
                $lookup: {
                    from: "promotions",
                    let: { productId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: [
                                        "$$productId",
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$scopes",
                                                        cond: { $eq: ["$$this.scopeType", "PRODUCT"] }
                                                    }
                                                },
                                                as: "s",
                                                in: "$$s.refId"
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { name: 1, discountType: 1, discountValue: 1, startDate: 1, endDate: 1 }
                        }
                    ],
                    as: "promotions"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: { path: "$category", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    name: 1,
                    images: 1,
                    price: 1,
                    createdAt: 1,
                    category: { name: 1 },
                    promotions: 1
                }
            }
        ]);
        const totalProduct = await Product_1.default.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalProduct / limitNumber) : 1;
        await redis.set(cacheKey, JSON.stringify({
            data: productList,
            pagination: {
                total: totalProduct,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            }
        }), 'EX', Math.floor(55));
        return {
            data: productList,
            pagination: {
                total: totalProduct,
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
exports.listProduct = listProduct;
const getProductById = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }
        const productDetail = await Product_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "promotions",
                    let: { productId: "$_id", productPrice: "$price" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: [
                                        "$$productId",
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$scopes",
                                                        cond: { $eq: ["$$this.scopeType", "PRODUCT"] },
                                                    },
                                                },
                                                as: "s",
                                                in: "$$s.refId",
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                discountType: 1,
                                discountValue: 1,
                                startDate: 1,
                                endDate: 1,
                            },
                        },
                        {
                            $addFields: {
                                discountedPrice: {
                                    $round: [
                                        {
                                            $max: [
                                                0,
                                                {
                                                    $cond: [
                                                        { $eq: ["$discountType", "PERCENT"] },
                                                        { $multiply: ["$$productPrice", { $subtract: [1, { $divide: ["$discountValue", 100] }] }] },
                                                        { $subtract: ["$$productPrice", "$discountValue"] },
                                                    ],
                                                },
                                            ],
                                        },
                                        2,
                                    ],
                                },
                            },
                        },
                    ],
                    as: "promotions",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    images: 1,
                    price: 1,
                    createdAt: 1,
                    category: { name: 1 },
                    promotions: 1,
                },
            },
        ]);
        if (!productDetail || productDetail.length === 0) {
            throw "Product not found";
        }
        return {
            data: productDetail,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getProductById = getProductById;
const createProduct = async (data) => {
    try {
        const checkProduct = await Product_1.default.findOne({ name: data.name });
        if (checkProduct)
            return { message: "Product already exists" };
        const checkCategory = await Category_1.default.findById(data.categoryId);
        if (!checkCategory)
            return { message: "Category is wrong" };
        const newProduct = await Product_1.default.create(data);
        return {
            data: newProduct,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.createProduct = createProduct;
const updateProduct = async (id, data) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.description !== undefined) {
            updateData.description = data.description;
        }
        if (data.images !== undefined) {
            updateData.images = data.images;
        }
        if (data.categoryId !== undefined) {
            if (!mongoose_1.default.Types.ObjectId.isValid(data.categoryId.toString())) {
                throw "Invalid Category ID";
            }
            updateData.categoryId = data.categoryId;
        }
        if (data.price !== undefined) {
            updateData.price = data.price;
        }
        if (Object.keys(updateData).length === 0) {
            throw "No valid fields to update";
        }
        const updatedProduct = await Product_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedProduct) {
            throw "Product not found";
        }
        return {
            data: updatedProduct,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }
        const promotionsWithProduct = await Promotion_1.default.find({
            scopes: {
                $elemMatch: {
                    scopeType: "PRODUCT",
                    refId: new mongoose_1.default.Types.ObjectId(id),
                },
            },
        });
        if (promotionsWithProduct.length > 0) {
            await Promotion_1.default.updateMany({ "scopes.refId": id }, { $pull: { scopes: { refId: new mongoose_1.default.Types.ObjectId(id) } } });
        }
        const deletedProduct = await Product_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw "Product not found";
        }
        return {
            data: { status: true },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.deleteProduct = deleteProduct;
