"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const promotion_1 = __importDefault(require("./promotion"));
const product_1 = __importDefault(require("./product"));
const profile_1 = __importDefault(require("./profile"));
const category_1 = __importDefault(require("./category"));
const router = express_1.default.Router();
const options = {
    allowedHeaders: ["X-Requested-With", "Content-Type", "Authorization"],
    credentials: true,
    methods: "GET,OPTIONS,PUT,POST,DELETE",
    preflightContinue: false,
    origin: true,
};
router.use((0, cors_1.default)(options));
router.use((0, morgan_1.default)((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ');
}));
router.options('*', (0, cors_1.default)(options));
router.use('/profile', profile_1.default);
router.use('/product', product_1.default);
router.use('/category', category_1.default);
router.use('/promotion', promotion_1.default);
exports.default = router;
