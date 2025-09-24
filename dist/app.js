'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const redis_1 = require("./configs/redis");
const routes_1 = __importDefault(require("./routes"));
const db_1 = __importDefault(require("./configs/db"));
// @ts-ignore
const postmanToOpenApi = require("postman-to-openapi");
dotenv_1.default.config();
const PORT = process.env.PORT;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
const mongooseController = new db_1.default(app);
mongooseController.connect(async (err, result) => {
    if (err)
        throw err.message;
    try {
        const db = result.db;
        db.connection.on('connected', () => console.log("Server api connected to MongoDB !", "MONGODB"));
        db.connection.on('error', (err) => {
            console.log("Server api MongoDB Error" + err, "MONGODB");
        });
        db.connection.on('disconnected', () => console.log("Server api disconnected from MongoDB !", "MONGODB"));
        const redis = (0, redis_1.getRedisClient)();
        redis.set('test', 'Hi Redis!');
        redis.get('test').then(console.log);
        const postmanFilePath = path_1.default.resolve('./codelab.postman_collection.json');
        const swaggerFilePath = path_1.default.resolve('./swagger.yaml');
        await postmanToOpenApi(postmanFilePath, swaggerFilePath, { defaultTag: 'API' });
        const swaggerRaw = fs_1.default.readFileSync(swaggerFilePath, 'utf-8');
        const swaggerDoc = yamljs_1.default.parse(swaggerRaw);
        if (!swaggerDoc.components)
            swaggerDoc.components = {};
        if (!swaggerDoc.components.securitySchemes)
            swaggerDoc.components.securitySchemes = {};
        swaggerDoc.components.securitySchemes.BearerAuth = {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        };
        swaggerDoc.security = [{ BearerAuth: [] }];
        for (const pathKey of Object.keys(swaggerDoc.paths || {})) {
            for (const methodKey of Object.keys(swaggerDoc.paths[pathKey] || {})) {
                if (!swaggerDoc.paths[pathKey][methodKey].security) {
                    swaggerDoc.paths[pathKey][methodKey].security = [{ BearerAuth: [] }];
                }
            }
        }
        const newYaml = yamljs_1.default.stringify(swaggerDoc, 10, 2);
        fs_1.default.writeFileSync(swaggerFilePath, newYaml, 'utf-8');
        const swaggerDocument = yamljs_1.default.load('./swagger.yaml');
        app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
        console.log('swagger generated');
        app.use('/api', routes_1.default);
        app.listen(PORT, async () => {
            console.log("Server api is ready on!!");
        });
    }
    catch (error) {
        console.log(error);
    }
});
