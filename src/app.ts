import dotenv from 'dotenv';
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' });

import express from 'express';
import path from 'path';
import { middlewares } from './middlewares';
import { errorHandler } from './middlewares/error';
import routes from './routes';

// Create Express server
const app = express();
middlewares(app);

// Return static files in '/public', for now without cache
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));

// Primary app routes.
app.use('/', routes);

// The error middleare must be the last
app.use(errorHandler);

export default app;
