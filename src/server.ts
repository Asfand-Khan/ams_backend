import express, { Application } from 'express';
import dotenv from 'dotenv';
import logger from './config/logger';
import prisma from './config/db';
import appSetup from './app';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Initialize the app with middleware and routes
appSetup(app);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// Start server with Prisma connection check
app.listen(PORT, async () => {
    try {
        await prisma.$connect();
        logger.info(`Database connected and server running on port ${PORT}`);
    } catch (error) {
        console.log(error);
        logger.error('Database connection error', error);
        process.exit(1);
    }
});