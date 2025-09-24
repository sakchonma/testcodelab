"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.updateCategorySchema = exports.createCategory = exports.createCategorySchema = exports.getCategoryById = exports.listCategory = exports.listCategorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const category_1 = require("../services/category");
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const listCategorySchema = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.number().required(),
        limit: joi_1.default.number().required(),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.listCategorySchema = listCategorySchema;
const createCategorySchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().messages({
            "string.empty": "ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อหมวดหมู่",
        }),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.createCategorySchema = createCategorySchema;
const updateCategorySchema = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().messages({
            "string.empty": "ชื่อหมวดหมู่ไม่สามารถเว้นว่างได้",
            "any.required": "กรุณาระบุชื่อหมวดหมู่",
        }),
    }).min(1);
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.updateCategorySchema = updateCategorySchema;
const listCategory = async (req, res, next) => {
    const { page, limit } = req.body;
    (0, category_1.listCategory)(page, limit)
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
exports.listCategory = listCategory;
const getCategoryById = async (req, res, next) => {
    const id = req.params.id;
    (0, category_1.getCategoryById)(id)
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
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res, next) => {
    const { name } = req.body;
    (0, category_1.createCategory)(name)
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
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    const id = req.params.id;
    const { name } = req.body;
    (0, category_1.updateCategory)(id, name)
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
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    const id = req.params.id;
    (0, category_1.deleteCategory)(id)
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
exports.deleteCategory = deleteCategory;
