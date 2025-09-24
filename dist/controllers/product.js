"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.updateProductSchema = exports.createProduct = exports.createProductSchema = exports.getProductById = exports.listProduct = exports.listProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const product_1 = require("../services/product");
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const listProductSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.number().required(),
        limit: joi_1.default.number().required(),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.listProductSchema = listProductSchema;
const listProduct = async (req, res, next) => {
    const { page, limit } = req.body;
    (0, product_1.listProduct)(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.listProduct = listProduct;
const createProductSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().messages({
            "string.empty": "ชื่อสินค้าไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อสินค้า",
        }),
        description: joi_1.default.string().allow("").optional(),
        images: joi_1.default.array().items(joi_1.default.string().uri().messages({
            "string.uri": "รูปภาพต้องเป็น URL ที่ถูกต้อง",
        })).optional(),
        categoryId: joi_1.default.string().hex().length(24).required().messages({
            "string.length": "categoryId ต้องเป็น ObjectId 24 ตัวอักษร",
            "any.required": "กรุณาระบุ categoryId",
        }),
        price: joi_1.default.number().positive().required().messages({
            "number.base": "ราคาเป็นตัวเลขเท่านั้น",
            "number.positive": "ราคาต้องมากกว่า 0",
            "any.required": "กรุณาระบุราคา",
        }),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.createProductSchema = createProductSchema;
const createProduct = async (req, res, next) => {
    (0, product_1.createProduct)(req.body).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.createProduct = createProduct;
const updateProductSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().optional().messages({
            "string.empty": "ชื่อสินค้าไม่สามารถเว้นว่างได้",
        }),
        description: joi_1.default.string().allow("").optional(),
        images: joi_1.default.array().items(joi_1.default.string().uri().messages({
            "string.uri": "รูปภาพต้องเป็น URL ที่ถูกต้อง",
        })).optional(),
        categoryId: joi_1.default.string().hex().length(24).optional().messages({
            "string.length": "categoryId ต้องเป็น ObjectId 24 ตัวอักษร",
        }),
        price: joi_1.default.number().positive().optional().messages({
            "number.base": "ราคาเป็นตัวเลขเท่านั้น",
            "number.positive": "ราคาต้องมากกว่า 0",
        }),
    }).min(1);
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.updateProductSchema = updateProductSchema;
const updateProduct = async (req, res, next) => {
    const data = req.body;
    const id = req.params.id;
    (0, product_1.updateProduct)(id, data).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.updateProduct = updateProduct;
const getProductById = async (req, res, next) => {
    const id = req.params.id;
    (0, product_1.getProductById)(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.getProductById = getProductById;
const deleteProduct = async (req, res, next) => {
    const id = req.params.id;
    (0, product_1.deleteProduct)(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.deleteProduct = deleteProduct;
