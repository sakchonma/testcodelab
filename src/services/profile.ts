import profileModel from '../models/Profile'
import { getRedisClient } from '../configs/redis';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'
dotenv.config();
const generateToken = (id: any, role: string) => jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '30d' });

const bcryptPassword = async (password: any) => {
    const salt = await bcrypt.genSalt(10)
    const crypted = await bcrypt.hash(password, salt)
    return crypted
}

const checkCompare = (passwordOne: any, passwordTwo: any) => {
    return bcrypt.compareSync(passwordOne, passwordTwo)
}

const registerProfile = async (username: string, email: string, password: string) => {
    try {
        const userExists = await profileModel.findOne({ email });
        if (userExists) return { message: 'User already exists' };

        const bcryptPass = await bcryptPassword(password);

        const user = await profileModel.create({ username, email, password: bcryptPass, role: 'user' });

        return {
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                jwtToken: generateToken(user._id, user.role),
            }
        };
    } catch (error) {
        throw error
    }
}

const loginProfile = async (email: string, password: string) => {
    try {
        const user: any = await profileModel.findOne({ email });
        if (!user) throw `User not found`;

        const isMatch = await checkCompare(password, user.password);
        if (!isMatch) throw `Password is wrong`;

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
    } catch (error) {
        throw error
    }
}

const listUserProfile = async (page: Number, limit: Number) => {
    try {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const redis = await getRedisClient();
        const cacheKey = `profile-list-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`use redis key: profile-list-${page}-${limit}`);
            return JSON.parse(cachedData)

        }
        const userList: any = await profileModel.find()
            .select('-password')
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });
        const totalUsers = await profileModel.countDocuments();
        const totalPages = limitNumber > 0 ? Math.ceil(totalUsers / limitNumber) : 1;
        await redis.set(
            cacheKey,
            JSON.stringify({
                data: userList,
                pagination: {
                    total: totalUsers,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                }
            }),
            'EX',
            Math.floor(55))
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
        } else {
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
    } catch (error) {
        throw error
    }
}

const getUserById = async (id: any) => {
    try {
        const user = await profileModel.findById(id).select('-password');
        if (user) {
            return {
                data: user,
            }
        } else {
            throw `User not found`
        }
    } catch (error) {
        throw error
    }
}

const updateProfile = async (id: string, data: any) => {
    try {
        const { username, email, role } = data;
        const updateData: any = {};

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        const userExists: any = await profileModel.findOne({ email });
        if (userExists) {
            if (userExists._id.toString() !== id) return { message: 'User already exists' };
        }

        const updatedUser = await profileModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            throw `User not found`;
        }

        return {
            data: updatedUser,
        };
    } catch (error) {
        throw error;
    }
}

const deleteProfile = async (id: string, idOwner: string) => {
    try {
        if (idOwner.toString() === id) throw `Invalid request: cannot perform this action with your own ID.`;
        const deletedUser = await profileModel.findByIdAndDelete(id);
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
    } catch (error) {
        throw error;
    }
}
const getAllKeyRedis = async () => {
    try {

        let cursor = "0";
        const keys: string[] = [];
        const redis = await getRedisClient();
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
        }
    } catch (error: any) {
        throw error.message ? error.message : error;
    }
};
export {
    registerProfile,
    loginProfile,
    listUserProfile,
    getUserById,
    updateProfile,
    deleteProfile,
    getAllKeyRedis
}
