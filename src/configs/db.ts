import mongoose from "mongoose"
mongoose.Promise = global.Promise
class MongooseController {
    constructor(app: any) {
        this.db = null
    }
    db: any
    async connect(cb: any) {
        try {
            this.db = await mongoose.connect(process.env.DB_DEV_URI || '',)
            console.log('Mongoose Ready!')
            return cb(null, {
                db: this.db,
            })

        } catch (err) {
            console.log('Mongoose connect error', err)
        }
    }
}

export default MongooseController