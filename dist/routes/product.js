"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../controllers/product");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/list', product_1.listProductSchema, product_1.listProduct);
router.get('/get/:id', product_1.getProductById, product_1.getProductById);
router.post('/create', (0, auth_1.default)("admin", "editor"), product_1.createProductSchema, product_1.createProduct);
router.put('/update/:id', (0, auth_1.default)("admin", "editor"), product_1.updateProductSchema, product_1.updateProduct);
router.delete('/delete/:id', (0, auth_1.default)("admin", "editor"), product_1.deleteProduct);
exports.default = router;
