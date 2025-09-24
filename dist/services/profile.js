"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllKeyRedis = exports.deleteProfile = exports.updateProfile = exports.getUserById = exports.listUserProfile = exports.loginProfile = exports.registerProfile = void 0;
const Profile_1 = __importDefault(require("../models/Profile"));
const redis_1 = require("../configs/redis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const generateToken = (id, role) => jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
const bcryptPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    const crypted = await bcryptjs_1.default.hash(password, salt);
    return crypted;
};
const checkCompare = (passwordOne, passwordTwo) => {
    return bcryptjs_1.default.compareSync(passwordOne, passwordTwo);
};
const registerProfile = async (username, email, password) => {
    try {
        const userExists = await Profile_1.default.findOne({ email });
        if (userExists)
            return { message: 'User already exists' };
        const bcryptPass = await bcryptPassword(password);
        const user = await Profile_1.default.create({ username, email, password: bcryptPass, role: 'user' });
        return {
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                jwtToken: generateToken(user._id, user.role),
            }
        };
    }
    catch (error) {
        throw error;
    }
};
exports.registerProfile = registerProfile;
const loginProfile = async (email, password) => {
    try {
        const user = await Profile_1.default.findOne({ email });
        if (!user)
            throw `User not found`;
        const isMatch = await checkCompare(password, user.password);
        if (!isMatch)
            throw `Password is wrong`;
        const jwtToken = generateToken(user._id, user.role);
        return {
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                jwtToken,
            },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.loginProfile = loginProfile;
const listUserProfile = async (page, limit) => {
    try {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await (0, redis_1.getRedisClient)();
        const cacheKey = `profile-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: profile-list-${page}-${limit}`);
            return JSON.parse(cachedData);
        }
        const userList = await Profile_1.default.find()
            .select('-password')
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });
        const totalUsers = await Profile_1.default.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalUsers / limitNumber) : 1;
        await redis.set(cacheKey, JSON.stringify({
            data: userList,
            pagination: {
                total: totalUsers,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            }
        }), 'EX', Math.floor(55));
        if (userList) {
            return {
                data: userList,
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                }
            };
        }
        else {
            return {
                data: [],
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                }
            };
        }
    }
    catch (error) {
        throw error;
    }
};
exports.listUserProfile = listUserProfile;
const getUserById = async (id) => {
    try {
        const user = await Profile_1.default.findById(id).select('-password');
        if (user) {
            return {
                data: user,
            };
        }
        else {
            throw `User not found`;
        }
    }
    catch (error) {
        throw error;
    }
};
exports.getUserById = getUserById;
const updateProfile = async (id, data) => {
    try {
        const { username, email, role } = data;
        const updateData = {};
        if (username)
            updateData.username = username;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        const userExists = await Profile_1.default.findOne({ email });
        if (userExists) {
            if (userExists._id.toString() !== id)
                return { message: 'User already exists' };
        }
        const updatedUser = await Profile_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select("-password");
        if (!updatedUser) {
            throw `User not found`;
        }
        return {
            data: updatedUser,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.updateProfile = updateProfile;
const deleteProfile = async (id, idOwner) => {
    try {
        if (idOwner.toString() === id)
            throw `Invalid request: cannot perform this action with your own ID.`;
        const deletedUser = await Profile_1.default.findByIdAndDelete(id);
        if (!deletedUser) {
            throw `User not found`;
        }
        return {
            data: {
                id: deletedUser._id,
                username: deletedUser.username,
                email: deletedUser.email,
                role: deletedUser.role,
            },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.deleteProfile = deleteProfile;
const getAllKeyRedis = async () => {
    try {
        let cursor = "0";
        const keys = [];
        const redis = await (0, redis_1.getRedisClient)();
        do {
            const result = await redis.scan(cursor, "MATCH", "*", "COUNT", 100);
            cursor = result[0];
            keys.push(...result[1]);
        } while (cursor !== "0");
        // let cursorValue = "0";
        // const data: Record<string, string | null> = {};
        // do {
        //     const result = await redis.scan(cursorValue, "MATCH", "*", "COUNT", 100);
        //     cursorValue = result[0];
        //     for (const key of result[1]) {
        //         const value = await redis.get(key);
        //         data[key] = value;
        //     }
        // } while (cursorValue !== "0");
        console.log("All keys:", keys);
        // console.log("All key-value:", data);
        return {
            AllKeys: keys,
            // AllKeyValue: data
        };
    }
    catch (error) {
        throw error.message ? error.message : error;
    }
};
exports.getAllKeyRedis = getAllKeyRedis;
