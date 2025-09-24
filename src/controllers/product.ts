import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import {
    listProduct as listProductService,
    getProductById as getProductByIdService,
    createProduct as createProductService,
    updateProduct as updateProductService,
    deleteProduct as deleteProductService
} from "../services/product";
import validateRequest from "../middleware/validateRequest";

const listProductSchema = (
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

const listProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit } = req.body;
    listProductService(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

const createProductSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "ชื่อสินค้าไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อสินค้า",
        }),
        description: Joi.string().allow("").optional(),
        images: Joi.array().items(
            Joi.string().uri().messages({
                "string.uri": "รูปภาพต้องเป็น URL ที่ถูกต้อง",
            })
        ).optional(),
        categoryId: Joi.string().hex().length(24).required().messages({
            "string.length": "categoryId ต้องเป็น ObjectId 24 ตัวอักษร",
            "any.required": "กรุณาระบุ categoryId",
        }),
        price: Joi.number().positive().required().messages({
            "number.base": "ราคาเป็นตัวเลขเท่านั้น",
            "number.positive": "ราคาต้องมากกว่า 0",
            "any.required": "กรุณาระบุราคา",
        }),
    });

    validateRequest(req, res, next, schema);
};

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    createProductService(req.body).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

const updateProductSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().optional().messages({
            "string.empty": "ชื่อสินค้าไม่สามารถเว้นว่างได้",
        }),
        description: Joi.string().allow("").optional(),
        images: Joi.array().items(
            Joi.string().uri().messages({
                "string.uri": "รูปภาพต้องเป็น URL ที่ถูกต้อง",
            })
        ).optional(),
        categoryId: Joi.string().hex().length(24).optional().messages({
            "string.length": "categoryId ต้องเป็น ObjectId 24 ตัวอักษร",
        }),
        price: Joi.number().positive().optional().messages({
            "number.base": "ราคาเป็นตัวเลขเท่านั้น",
            "number.positive": "ราคาต้องมากกว่า 0",
        }),
    }).min(1);

    validateRequest(req, res, next, schema);
};

const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data = req.body;
    const id = req.params.id;
    updateProductService(id, data).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    getProductByIdService(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    deleteProductService(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

export {
    listProductSchema,
    listProduct,
    getProductById,
    createProductSchema,
    createProduct,
    updateProductSchema,
    updateProduct,
    deleteProduct,
};
