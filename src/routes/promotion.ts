import express from "express"
import {
    listPromotionSchema,
    listPromotion,
    getPromotionById,
    createPromotionSchema,
    createPromotion,
    updatePromotionSchema,
    updatePromotion,
    deletePromotion,
    getActiveFlashSales,
} from "../controllers/promotion"

import authorize from "../middleware/auth"
const router = express.Router()

router.post('/list', listPromotionSchema, listPromotion)
router.get('/flashsale', getActiveFlashSales)
router.get('/get/:id', getPromotionById)
router.post('/create', authorize("admin", "editor"), createPromotionSchema, createPromotion)
router.put('/update/:id', authorize("admin", "editor"), updatePromotionSchema, updatePromotion)
router.delete('/delete/:id', authorize("admin", "editor"), deletePromotion)


export default router