"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveFlashSales = exports.deletePromotion = exports.updatePromotion = exports.updatePromotionSchema = exports.createPromotion = exports.createPromotionSchema = exports.getPromotionById = exports.listPromotion = exports.listPromotionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const promotion_1 = require("../services/promotion");
const listPromotionSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.number().required(),
        limit: joi_1.default.number().required(),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.listPromotionSchema = listPromotionSchema;
const listPromotion = async (req, res, next) => {
    const { page, limit } = req.body;
    (0, promotion_1.listPromotion)(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.listPromotion = listPromotion;
const createPromotionSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().allow("").optional(),
        discountType: joi_1.default.string().valid("PERCENT", "AMOUNT").required(),
        discountValue: joi_1.default.number().positive().required(),
        startDate: joi_1.default.date().required(),
        endDate: joi_1.default.date().required(),
        isFlashSale: joi_1.default.boolean().optional(),
        flashSaleStart: joi_1.default.date().optional(),
        flashSaleEnd: joi_1.default.date().optional(),
        scopes: joi_1.default.array().items(joi_1.default.object({
            scopeType: joi_1.default.string().valid("PRODUCT", "CATEGORY", "ALL").required(),
            refId: joi_1.default.string().hex().length(24).optional(),
        })).optional(),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.createPromotionSchema = createPromotionSchema;
const createPromotion = async (req, res, next) => {
    (0, promotion_1.createPromotion)(req.body)
        .then((result) => {
        return res.status(200).json({
            status: true,
            ...result
        });
    })
        .catch((error) => {
        return res.status(200).json({
            status: false,
            message: error
        });
    });
};
exports.createPromotion = createPromotion;
const updatePromotionSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().optional(),
        description: joi_1.default.string().allow("").optional(),
        discountType: joi_1.default.string().valid("PERCENT", "AMOUNT").optional(),
        discountValue: joi_1.default.number().positive().optional(),
        startDate: joi_1.default.date().optional(),
        endDate: joi_1.default.date().optional(),
        isFlashSale: joi_1.default.boolean().optional(),
        flashSaleStart: joi_1.default.date().optional(),
        flashSaleEnd: joi_1.default.date().optional(),
        scopes: joi_1.default.array().items(joi_1.default.object({
            scopeType: joi_1.default.string().valid("PRODUCT", "CATEGORY", "ALL").required(),
            refId: joi_1.default.string().hex().length(24).optional(),
        })).optional(),
    }).min(1);
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.updatePromotionSchema = updatePromotionSchema;
const updatePromotion = async (req, res, next) => {
    const data = req.body;
    const id = req.params.id;
    (0, promotion_1.updatePromotion)(id, data)
        .then((result) => {
        return res.status(200).json({
            status: true,
            ...result
        });
    })
        .catch((error) => {
        return res.status(200).json({
            status: false,
            message: error
        });
    });
};
exports.updatePromotion = updatePromotion;
const getPromotionById = async (req, res, next) => {
    const id = req.params.id;
    (0, promotion_1.getPromotionById)(id)
        .then((result) => {
        return res.status(200).json({
            status: true,
            ...result
        });
    })
        .catch((error) => {
        return res.status(200).json({
            status: false,
            message: error
        });
    });
};
exports.getPromotionById = getPromotionById;
const deletePromotion = async (req, res, next) => {
    const id = req.params.id;
    (0, promotion_1.deletePromotion)(id)
        .then((result) => {
        return res.status(200).json({
            status: true,
            ...result
        });
    })
        .catch((error) => {
        return res.status(200).json({
            status: false,
            message: error
        });
    });
};
exports.deletePromotion = deletePromotion;
const getActiveFlashSales = async (req, res, next) => {
    (0, promotion_1.getActiveFlashSales)()
        .then((result) => {
        return res.status(200).json({
            status: true,
            ...result
        });
    })
        .catch((error) => {
        return res.status(200).json({
            status: false,
            message: error
        });
    });
};
exports.getActiveFlashSales = getActiveFlashSales;
