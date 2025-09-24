import express from "express"
import {
    registerProfileSchema,
    registerProfile,
    loginProfileSchema,
    loginProfile,
    listUserProfileSchema,
    listUserProfile,
    getUserById,
    updateProfileSchema,
    updateProfile,
    deleteProfile,
    getAllKeyRedisController
} from "../controllers/profile"
import authorize from "../middleware/auth"
const router = express.Router()

router.post('/register', registerProfileSchema, registerProfile)
router.post('/login', loginProfileSchema, loginProfile)
router.post('/list', authorize(), listUserProfileSchema, listUserProfile)
router.get('/get/:id', authorize("admin", "editor",), getUserById)
router.put('/update/:id', authorize("admin", "editor"), updateProfileSchema, updateProfile)
router.delete('/delete/:id', authorize("admin",), deleteProfile)
router.get('/allredis', getAllKeyRedisController)
export default router