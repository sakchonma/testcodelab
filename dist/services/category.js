"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.listCategory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Category_1 = __importDefault(require("../models/Category"));
const redis_1 = require("../configs/redis");
const listCategory = async (page, limit) => {
    try {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `category-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: category-list-${page}-${limit}`);
            return JSON.parse(cachedData);
        }
        const categoryList = await Category_1.default
            .find()
            .select({
            name: 1,
            createAt: 1,
        })
            .skip(skip)
            .limit(limitNumber)
            .sort({ createAt: -1 });
        const totalCategory = await Category_1.default.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalCategory / limitNumber) : 1;
        await redis.set(cacheKey, JSON.stringify({
            data: categoryList,
            pagination: {
                total: totalCategory,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            }
        }), 'EX', Math.floor(55));
        return {
            data: categoryList,
            pagination: {
                total: totalCategory,
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
exports.listCategory = listCategory;
const getCategoryById = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `Category-${id}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: Category-${id}`);
            return JSON.parse(cachedData);
        }
        const categoryDetail = await Category_1.default.findById(id);
        if (!categoryDetail) {
            throw "Category not found";
        }
        await redis.set(cacheKey, JSON.stringify({
            data: categoryDetail
        }), 'EX', Math.floor(55));
        return {
            data: categoryDetail,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (name) => {
    try {
        const checkCategory = await Category_1.default.findOne({ name });
        if (checkCategory)
            return { message: "Category already exists" };
        const newCategory = await Category_1.default.create({ name });
        return {
            data: newCategory,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (id, name) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }
        if (!name)
            throw "Name is required";
        const updatedCategory = await Category_1.default.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
        if (!updatedCategory) {
            throw "Category not found";
        }
        return {
            data: updatedCategory,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }
        const deletedCategory = await Category_1.default.findByIdAndDelete(id);
        if (!deletedCategory) {
            throw "Category not found";
        }
        return {
            data: { status: true },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.deleteCategory = deleteCategory;
