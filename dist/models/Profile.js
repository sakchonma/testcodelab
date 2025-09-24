"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const ProfileSchema = new Schema({
    username: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["admin", "editor", "user"],
        default: "user"
    },
    createAt: {
        type: Date,
        default: new Date().getTime()
    },
});
const Profile = mongoose_1.default.model('Profile', ProfileSchema);
exports.default = Profile;
