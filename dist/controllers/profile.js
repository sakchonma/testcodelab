"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllKeyRedisController = exports.deleteProfile = exports.updateProfile = exports.updateProfileSchema = exports.getUserById = exports.listUserProfile = exports.listUserProfileSchema = exports.loginProfile = exports.loginProfileSchema = exports.registerProfile = exports.registerProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const profile_1 = require("../services/profile");
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const registerProfileSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(30).required(),
        email: joi_1.default.string().email({ tlds: { allow: false } }).required(),
        password: joi_1.default.string().min(8).max(50)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
            .message("Password must include uppercase, lowercase, number, and special character").required(),
        confirmPassword: joi_1.default.any()
            .valid(joi_1.default.ref("password"))
            .required()
            .messages({ "any.only": "Passwords do not match" })
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.registerProfileSchema = registerProfileSchema;
const registerProfile = async (req, res, next) => {
    const { username, email, password, } = req.body;
    (0, profile_1.registerProfile)(username, email, password).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.registerProfile = registerProfile;
const loginProfileSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email({ tlds: { allow: false } }).required(),
        password: joi_1.default.string().min(8).max(50)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.loginProfileSchema = loginProfileSchema;
const loginProfile = async (req, res, next) => {
    const { email, password, } = req.body;
    (0, profile_1.loginProfile)(email, password).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.loginProfile = loginProfile;
const listUserProfileSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.number().required(),
        limit: joi_1.default.number().required(),
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.listUserProfileSchema = listUserProfileSchema;
const listUserProfile = async (req, res, next) => {
    const { page, limit, } = req.body;
    (0, profile_1.listUserProfile)(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.listUserProfile = listUserProfile;
const getUserById = async (req, res, next) => {
    const id = req.params.id;
    (0, profile_1.getUserById)(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.getUserById = getUserById;
const updateProfileSchema = (req, res, next) => {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(30).required(),
        email: joi_1.default.string().email({ tlds: { allow: false } }).required(),
        role: joi_1.default.string().valid("admin", "editor", "user").required().messages({
            "any.only": "Role must be one of admin, editor, or user",
            "any.required": "Role is required"
        })
    });
    (0, validateRequest_1.default)(req, res, next, schema);
};
exports.updateProfileSchema = updateProfileSchema;
const updateProfile = async (req, res, next) => {
    const data = req.body;
    const id = req.params.id;
    (0, profile_1.updateProfile)(id, data).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.updateProfile = updateProfile;
const deleteProfile = async (req, res, next) => {
    const id = req.params.id;
    const user = req;
    (0, profile_1.deleteProfile)(id, user.user._id.toString()).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
};
exports.deleteProfile = deleteProfile;
const getAllKeyRedisController = async (req, res, next) => {
    (0, profile_1.getAllKeyRedis)().then((result) => {
        if (result) {
            return res
                .status(200)
                .json({
                status: true,
                ...result,
            });
        }
        else {
            return res
                .status(200)
                .json({
                status: false,
                message: "try again"
            });
        }
    })
        .catch((error) => {
        return res.status(200)
            .json({
            status: false,
            message: error
        });
    });
};
exports.getAllKeyRedisController = getAllKeyRedisController;
