import path from 'path';
import express from 'express';
import { OpenApiValidator } from 'express-openapi-validator';
import config from '../config';
import errorHandler from './middlewares/error.handler';

export default function openapi(app:express.Application, routes: (app: express.Application) => void) {
    const apiSpecPath = path.join(__dirname, 'api.yml');
    const specRoute = process.env.OPENAPI_SPEC || '/spec'
    app.use(`${config.endpoint + specRoute}`, express.static(apiSpecPath));

    new OpenApiValidator({
        apiSpecPath,
    }).install(app);

    routes(app);
    app.use(errorHandler);
}