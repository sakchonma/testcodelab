import { Request, Response, NextFunction } from "express";
import * as _ from "lodash";

export default async function validateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    schema: any
) {
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
    } catch (error: any) {
        const message = error.details
            ? error.details.map((x: { message: any }) => x.message).join(", ")
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

const replaceNewlines = (str: string, newSubstr: string = "") => {
    return str.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, newSubstr).trim();
};

const newlineTransformation = (obj: any) => {
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
