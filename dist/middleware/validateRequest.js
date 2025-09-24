"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateRequest;
const _ = __importStar(require("lodash"));
async function validateRequest(req, res, next, schema) {
    try {
        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        const value = await schema.validateAsync(req.body, options);
        const transformedValue = newlineTransformation(value);
        req.body = transformedValue;
        next();
    }
    catch (error) {
        const message = error.details
            ? error.details.map((x) => x.message).join(", ")
            : error.message || "Validation error";
        return res.status(200).json({
            status: "false",
            message: `Validation error: ${message}`,
        });
    }
}
const keysToBeReplaced = {
    email: true,
    address: true,
    signature: true,
};
const replaceNewlines = (str, newSubstr = "") => {
    return str.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, newSubstr).trim();
};
const newlineTransformation = (obj) => {
    if (typeof obj === "object" && obj !== null) {
        for (const path in keysToBeReplaced) {
            if (_.has(obj, path)) {
                let val = _.get(obj, path);
                if (val && typeof val === "string") {
                    val = replaceNewlines(val, " ");
                    _.set(obj, path, val);
                }
            }
        }
    }
    return obj;
};
