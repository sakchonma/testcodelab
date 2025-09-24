import { Types } from "mongoose";

export interface IPromotionScope {
    scopeType: "PRODUCT" | "CATEGORY" | "ALL";
    refId?: Types.ObjectId;
}

export interface IPromotionDetail {
    name: string;
    description?: string;
    discountType: "PERCENT" | "AMOUNT";
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isFlashSale?: boolean;
    flashSaleStart?: Date;
    flashSaleEnd?: Date;
    scopes?: IPromotionScope[];
    createAt?: Date;
}
