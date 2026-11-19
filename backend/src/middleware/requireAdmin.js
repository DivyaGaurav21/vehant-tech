import { HttpError } from '../utils/httpError.js';
import { verifyAdminToken } from '../services/authService.js';
export const requireAdmin = (request, response, next) => {
    const authorization = request.header('authorization');
    if (!authorization?.startsWith('Bearer ')) {
        next(new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Sign in as an administrator to perform this action'));
        return;
    }
    try {
        const token = authorization.slice('Bearer '.length).trim();
        if (!token)
            throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'A bearer token is required');
        response.locals.admin = verifyAdminToken(token);
        next();
    }
    catch (error) {
        next(error);
    }
};
