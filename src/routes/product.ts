import express from "express"
import {
    listProductSchema,
    listProduct,
    getProductById,
    createProductSchema,
    createProduct,
    updateProductSchema,
    updateProduct,
    deleteProduct,
} from "../controllers/product"

import authorize from "../middleware/auth"
const router = express.Router()

router.post('/list', listProductSchema, listProduct)
router.get('/get/:id', getProductById, getProductById)
router.post('/create', authorize("admin", "editor"), createProductSchema, createProduct)
router.put('/update/:id', authorize("admin", "editor"), updateProductSchema, updateProduct)
router.delete('/delete/:id', authorize("admin", "editor"), deleteProduct)

export default router