import {
    NextFunction,
    Request,
    Response
} from "express"
import Joi from "joi"
import {
    registerProfile as registerProfileService,
    loginProfile as loginProfileService,
    listUserProfile as listUserProfileService,
    getUserById as getUserByIdService,
    updateProfile as updateProfileService,
    deleteProfile as deleteProfileService,
    getAllKeyRedis as getAllKeyRedis,
} from "../services/profile"
import validateRequest from "../middleware/validateRequest"

const registerProfileSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(8).max(50)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
            .message("Password must include uppercase, lowercase, number, and special character").required(),
        confirmPassword: Joi.any()
            .valid(Joi.ref("password"))
            .required()
            .messages({ "any.only": "Passwords do not match" })

    })

    validateRequest(req, res, next, schema)
}
const registerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        username,
        email,
        password,
    } = req.body
    registerProfileService(username, email, password).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const loginProfileSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(8).max(50)
            .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    })

    validateRequest(req, res, next, schema)
}
const loginProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        email,
        password,
    } = req.body
    loginProfileService(email, password).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const listUserProfileSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        page: Joi.number().required(),
        limit: Joi.number().required(),
    })

    validateRequest(req, res, next, schema)
}
const listUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        page,
        limit,
    } = req.body
    listUserProfileService(page, limit).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id
    getUserByIdService(id).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const updateProfileSchema = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        role: Joi.string().valid("admin", "editor", "user").required().messages({
            "any.only": "Role must be one of admin, editor, or user",
            "any.required": "Role is required"
        })
    })

    validateRequest(req, res, next, schema)
}
const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data = req.body
    const id = req.params.id
    updateProfileService(id, data).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id
    const user: any = req
    deleteProfileService(id, user.user._id.toString()).then((result) => {
        return res.status(200).json({
            status: true, ...result
        });
    }).catch((error: any) => {
        return res.status(200).json({
            status: false, message: error
        });
    });
}
const getAllKeyRedisController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    getAllKeyRedis().then((result) => {
        if (result) {
            return res
                .status(200)
                .json({
                    status: true,
                    ...result,
                })
        } else {
            return res
                .status(200)
                .json({
                    status: false,
                    message: "try again"
                })
        }
    })
        .catch((error: any) => {
            return res.status(200)
                .json({
                    status: false,
                    message: error
                })
        })
}
export {
    registerProfileSchema,
    registerProfile,
    loginProfileSchema,
    loginProfile,
    listUserProfileSchema,
    listUserProfile,
    getUserById,
    updateProfileSchema,
    updateProfile,
    deleteProfile,
    getAllKeyRedisController
}