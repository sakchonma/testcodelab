import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import {
    listCategory as listCategoryService,
    getCategoryById as getCategoryByIdService,
    createCategory as createCategoryService,
    updateCategory as updateCategoryService,
    deleteCategory as deleteCategoryService
} from "../services/category";
import validateRequest from "../middleware/validateRequest";

const listCategorySchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        page: Joi.number().required(),
        limit: Joi.number().required(),
    });

    validateRequest(req, res, next, schema);
};

const createCategorySchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อหมวดหมู่",
        }),
    });

    validateRequest(req, res, next, schema);
};

const updateCategorySchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อหมวดหมู่",
        }),
    }).min(1);

    validateRequest(req, res, next, schema);
};

const listCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit } = req.body;
    listCategoryService(page, limit)
        .then((result) => {
            return res.status(200).json({
                status: true,
                ...result
            });
        })
        .catch((error: any) => {
            return res.status(200).json({
                status: false,
                message: error
            });
        });
};

const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    getCategoryByIdService(id)
        .then((result) => {
            return res.status(200).json({
                status: true,
                ...result
            });
        })
        .catch((error: any) => {
            return res.status(200).json({
                status: false,
                message: error
            });
        });
};

const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name } = req.body;
    createCategoryService(name)
        .then((result) => {
            return res.status(200).json({
                status: true,
                ...result
            });
        })
        .catch((error: any) => {
            return res.status(200).json({
                status: false,
                message: error
            });
        });
};

const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    const { name } = req.body;
    updateCategoryService(id, name)
        .then((result) => {
            return res.status(200).json({
                status: true,
                ...result
            });
        })
        .catch((error: any) => {
            return res.status(200).json({
                status: false,
                message: error
            });
        });
};

const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    deleteCategoryService(id)
        .then((result) => {
            return res.status(200).json({
                status: true,
                ...result
            });
        })
        .catch((error: any) => {
            return res.status(200).json({
                status: false,
                message: error
            });
        });
};

export {
    listCategorySchema,
    listCategory,
    getCategoryById,
    createCategorySchema,
    createCategory,
    updateCategorySchema,
    updateCategory,
    deleteCategory,
};
