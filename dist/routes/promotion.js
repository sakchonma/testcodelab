"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotion_1 = require("../controllers/promotion");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/list', promotion_1.listPromotionSchema, promotion_1.listPromotion);
router.get('/flashsale', promotion_1.getActiveFlashSales);
router.get('/get/:id', promotion_1.getPromotionById);
router.post('/create', (0, auth_1.default)("admin", "editor"), promotion_1.createPromotionSchema, promotion_1.createPromotion);
router.put('/update/:id', (0, auth_1.default)("admin", "editor"), promotion_1.updatePromotionSchema, promotion_1.updatePromotion);
router.delete('/delete/:id', (0, auth_1.default)("admin", "editor"), promotion_1.deletePromotion);
exports.default = router;
