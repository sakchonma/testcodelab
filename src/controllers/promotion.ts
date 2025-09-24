import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validateRequest from "../middleware/validateRequest";
import {
    listPromotion as listPromotionService,
    getPromotionById as getPromotionByIdService,
    createPromotion as createPromotionService,
    updatePromotion as updatePromotionService,
    deletePromotion as deletePromotionService,
    getActiveFlashSales as getActiveFlashSalesService
} from "../services/promotion";

const listPromotionSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        page: Joi.number().required(),
        limit: Joi.number().required(),
    });

    validateRequest(req, res, next, schema)

}

const listPromotion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { page, limit } = req.body;
    listPromotionService(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};

const createPromotionSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        discountType: Joi.string().valid("PERCENT", "AMOUNT").required(),
        discountValue: Joi.number().positive().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        isFlashSale: Joi.boolean().optional(),
        flashSaleStart: Joi.date().optional(),
        flashSaleEnd: Joi.date().optional(),
        scopes: Joi.array().items(
            Joi.object({
                scopeType: Joi.string().valid("PRODUCT", "CATEGORY", "ALL").required(),
                refId: Joi.string().hex().length(24).optional(),
            })
        ).optional(),
    });
    validateRequest(req, res, next, schema);
};

const createPromotion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    createPromotionService(req.body)
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

const updatePromotionSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().allow("").optional(),
        discountType: Joi.string().valid("PERCENT", "AMOUNT").optional(),
        discountValue: Joi.number().positive().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        isFlashSale: Joi.boolean().optional(),
        flashSaleStart: Joi.date().optional(),
        flashSaleEnd: Joi.date().optional(),
        scopes: Joi.array().items(
            Joi.object({
                scopeType: Joi.string().valid("PRODUCT", "CATEGORY", "ALL").required(),
                refId: Joi.string().hex().length(24).optional(),
            })
        ).optional(),
    }).min(1);
    validateRequest(req, res, next, schema);
};

const updatePromotion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data = req.body;
    const id = req.params.id;
    updatePromotionService(id, data)
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

const getPromotionById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;
    getPromotionByIdService(id)
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

const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    deletePromotionService(id)
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

const getActiveFlashSales = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    getActiveFlashSalesService()
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
    listPromotionSchema,
    listPromotion,
    getPromotionById,
    createPromotionSchema,
    createPromotion,
    updatePromotionSchema,
    updatePromotion,
    deletePromotion,
    getActiveFlashSales,
};
