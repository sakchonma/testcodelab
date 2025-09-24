import mongoose from "mongoose";
import productModel from "../models/Product";
import CategoryModel from "../models/Category";
import PromotionModel from "../models/Promotion";
import { getRedisClient } from '../configs/redis';
import {
    IProductDetail
} from "../types/product";

const listProduct = async (page: number, limit: number) => {
    try {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await getRedisClient();
        const cacheKey = `product-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: product-list-${page}-${limit}`);
            return JSON.parse(cachedData)

        }
        const productList = await productModel.aggregate([
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

        const totalProduct = await productModel.countDocuments();
        const totalPages =
            limitNumber > 0 ? Math.ceil(totalProduct / limitNumber) : 1;
        await redis.set(
            cacheKey,
            JSON.stringify({
                data: productList,
                pagination: {
                    total: totalProduct,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                }
            }),
            'EX',
            Math.floor(55))
        return {
            data: productList,
            pagination: {
                total: totalProduct,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            },
        };
    } catch (error) {
        throw error;
    }
};

const getProductById = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }
        const productDetail = await productModel.aggregate([
            {
                $match:
                {
                    _id: new mongoose.Types.ObjectId(id)
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
    } catch (error) {
        throw error;
    }
};

const createProduct = async (data: IProductDetail) => {
    try {

        const checkProduct = await productModel.findOne({ name: data.name });
        if (checkProduct) return { message: "Product already exists" };

        const checkCategory = await CategoryModel.findById(data.categoryId);
        if (!checkCategory) return { message: "Category is wrong" };

        const newProduct = await productModel.create(data);
        return {
            data: newProduct,
        };
    } catch (error) {
        throw error;
    }
};

const updateProduct = async (id: string, data: Partial<IProductDetail>) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }

        const updateData: Partial<IProductDetail> = {};
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
            if (!mongoose.Types.ObjectId.isValid(data.categoryId.toString())) {
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

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            throw "Product not found";
        }

        return {
            data: updatedProduct,
        };
    } catch (error) {
        throw error;
    }
};

const deleteProduct = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Product ID";
        }

        const promotionsWithProduct = await PromotionModel.find({
            scopes: {
                $elemMatch: {
                    scopeType: "PRODUCT",
                    refId: new mongoose.Types.ObjectId(id),
                },
            },
        });
        if (promotionsWithProduct.length > 0) {
            await PromotionModel.updateMany(
                { "scopes.refId": id },
                { $pull: { scopes: { refId: new mongoose.Types.ObjectId(id) } } }
            );
        }

        const deletedProduct = await productModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            throw "Product not found";
        }

        return {
            data: { status: true },
        };
    } catch (error) {
        throw error;
    }
};

export {
    listProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
