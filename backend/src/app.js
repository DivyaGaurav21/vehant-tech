import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { clientOrigins } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/apiRoutes.js';
export const app = express();
app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        },
    },
}));
app.use(cors({ origin: clientOrigins }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_request, response) => {
    response.json({ success: true, data: { status: 'ok' } });
});
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
