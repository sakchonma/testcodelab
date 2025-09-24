'use strict';

import dotenv from 'dotenv'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import fs from "fs";
import path from "path";
import { getRedisClient } from './configs/redis';
import routes from './routes'
import MongooseController from './configs/db'

// @ts-ignore
import postmanToOpenApi = require('postman-to-openapi');

dotenv.config()
const PORT = process.env.PORT
const app = express()
app.use(helmet())
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))
const mongooseController = new MongooseController(app)

mongooseController.connect(async (err: any, result: any) => {
    if (err) throw err.message

    try {

        const db = result.db
        db.connection.on('connected', () => console.log("Server api connected to MongoDB !", "MONGODB"))
        db.connection.on('error', (err: any) => {
            console.log("Server api MongoDB Error" + err, "MONGODB")
        })
        db.connection.on('disconnected', () => console.log("Server api disconnected from MongoDB !", "MONGODB"))

        const redis = getRedisClient();
        redis.set('test', 'Hi Redis!');
        redis.get('test').then(console.log);

        const postmanFilePath = path.resolve('./codelab.postman_collection.json');
        const swaggerFilePath = path.resolve('./swagger.yaml');
        await postmanToOpenApi(postmanFilePath, swaggerFilePath, { defaultTag: 'API' });
        const swaggerRaw = fs.readFileSync(swaggerFilePath, 'utf-8');
        const swaggerDoc = YAML.parse(swaggerRaw) as any;
        if (!swaggerDoc.components) swaggerDoc.components = {};
        if (!swaggerDoc.components.securitySchemes) swaggerDoc.components.securitySchemes = {};
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
        const newYaml = YAML.stringify(swaggerDoc, 10, 2);
        fs.writeFileSync(swaggerFilePath, newYaml, 'utf-8');
        const swaggerDocument = YAML.load('./swagger.yaml')
        app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
        console.log('swagger generated');

        app.use('/api', routes)


        app.listen(PORT, async () => {
            console.log("Server api is ready on!!")
        })


    } catch (error) {
        console.log(error)
    }
})
