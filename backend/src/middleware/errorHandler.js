import mongoose from 'mongoose';
import { HttpError } from '../utils/httpError.js';
export const notFoundHandler = (request, _response, next) => {
    next(new HttpError(404, 'ROUTE_NOT_FOUND', `No route for ${request.method} ${request.path}`));
};
export const errorHandler = (error, _request, response, _next) => {
    if (error instanceof HttpError) {
        response.status(error.status).json({
            success: false,
            error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
        });
        return;
    }
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
        response.status(400).json({
            success: false,
            error: { code: 'DATABASE_VALIDATION_ERROR', message: error.message },
        });
        return;
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        response.status(409).json({
            success: false,
            error: { code: 'DUPLICATE_RECORD', message: 'A record with the same unique key already exists' },
        });
        return;
    }
    console.error('Unhandled API error', error);
    response.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred' },
    });
};
