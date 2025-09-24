import mongoose from "mongoose";
import CategoryModel from "../models/Category";
import { getRedisClient } from '../configs/redis';

const listCategory = async (page: number, limit: number) => {
    try {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await getRedisClient();
        const cacheKey = `category-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: category-list-${page}-${limit}`);
            return JSON.parse(cachedData)

        }
        const categoryList = await CategoryModel
            .find()
            .select({
                name: 1,
                createAt: 1,
            })
            .skip(skip)
            .limit(limitNumber)
            .sort({ createAt: -1 });

        const totalCategory = await CategoryModel.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalCategory / limitNumber) : 1;
        await redis.set(
            cacheKey,
            JSON.stringify({
                data: categoryList,
                pagination: {
                    total: totalCategory,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                }
            }),
            'EX',
            Math.floor(55))
        return {
            data: categoryList,
            pagination: {
                total: totalCategory,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            },
        };
    } catch (error) {
        throw error;
    }
};

const getCategoryById = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }
        const redis = await getRedisClient();
        const cacheKey = `Category-${id}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: Category-${id}`);
            return JSON.parse(cachedData)

        }
        const categoryDetail = await CategoryModel.findById(id);
        if (!categoryDetail) {
            throw "Category not found";
        }
        await redis.set(
            cacheKey,
            JSON.stringify({
                data: categoryDetail
            }),
            'EX',
            Math.floor(55))
        return {
            data: categoryDetail,
        };
    } catch (error) {
        throw error;
    }
};

const createCategory = async (name: string) => {
    try {
        const checkCategory = await CategoryModel.findOne({ name });
        if (checkCategory) return { message: "Category already exists" };

        const newCategory = await CategoryModel.create({ name });
        return {
            data: newCategory,
        };
    } catch (error) {
        throw error;
    }
};

const updateCategory = async (id: string, name: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }

        if (!name) throw "Name is required";

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            throw "Category not found";
        }

        return {
            data: updatedCategory,
        };
    } catch (error) {
        throw error;
    }
};

const deleteCategory = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "Invalid Category ID";
        }

        const deletedCategory = await CategoryModel.findByIdAndDelete(id);
        if (!deletedCategory) {
            throw "Category not found";
        }

        return {
            data: { status: true },
        };
    } catch (error) {
        throw error;
    }
};

export {
    listCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
