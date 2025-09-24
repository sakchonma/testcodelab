import express from "express"
import {
    listCategorySchema,
    listCategory,
    getCategoryById,
    createCategorySchema,
    createCategory,
    updateCategorySchema,
    updateCategory,
    deleteCategory,
} from "../controllers/category"
import authorize from "../middleware/auth"
const router = express.Router()

router.post('/list', authorize(), listCategorySchema, listCategory)
router.get('/get/:id', authorize(), getCategoryById)
router.post('/create', authorize("admin", "editor"), createCategorySchema, createCategory)
router.put('/update/:id', authorize("admin", "editor"), updateCategorySchema, updateCategory)
router.delete('/delete/:id', authorize("admin"), deleteCategory)

export default router