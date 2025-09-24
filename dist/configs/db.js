"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.Promise = global.Promise;
class MongooseController {
    constructor(app) {
        this.db = null;
    }
    async connect(cb) {
        try {
            this.db = await mongoose_1.default.connect(process.env.DB_DEV_URI || '');
            console.log('Mongoose Ready!');
            return cb(null, {
                db: this.db,
            });
        }
        catch (err) {
            console.log('Mongoose connect error', err);
        }
    }
}
exports.default = MongooseController;
