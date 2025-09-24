"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_1 = require("../controllers/category");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/list', (0, auth_1.default)(), category_1.listCategorySchema, category_1.listCategory);
router.get('/get/:id', (0, auth_1.default)(), category_1.getCategoryById);
router.post('/create', (0, auth_1.default)("admin", "editor"), category_1.createCategorySchema, category_1.createCategory);
router.put('/update/:id', (0, auth_1.default)("admin", "editor"), category_1.updateCategorySchema, category_1.updateCategory);
router.delete('/delete/:id', (0, auth_1.default)("admin"), category_1.deleteCategory);
exports.default = router;
