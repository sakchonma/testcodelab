"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profile_1 = require("../controllers/profile");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/register', profile_1.registerProfileSchema, profile_1.registerProfile);
router.post('/login', profile_1.loginProfileSchema, profile_1.loginProfile);
router.post('/list', (0, auth_1.default)(), profile_1.listUserProfileSchema, profile_1.listUserProfile);
router.get('/get/:id', (0, auth_1.default)("admin", "editor"), profile_1.getUserById);
router.put('/update/:id', (0, auth_1.default)("admin", "editor"), profile_1.updateProfileSchema, profile_1.updateProfile);
router.delete('/delete/:id', (0, auth_1.default)("admin"), profile_1.deleteProfile);
router.get('/allredis', profile_1.getAllKeyRedisController);
exports.default = router;
