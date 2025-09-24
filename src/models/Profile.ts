import mongoose from "mongoose"
const { Schema } = mongoose

const ProfileSchema = new Schema({
    username: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["admin", "editor", "user"],
        default: "user"
    },
    createAt: {
        type: Date,
        default: new Date().getTime()
    },
})

const Profile = mongoose.model('Profile', ProfileSchema)
export default Profile