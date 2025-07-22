// import express, { Application } from "express";
// import dotenv from "dotenv";
// import logger from "./config/logger";
// import prisma from "./config/db";
// import appSetup from "./app";

// // socket io setup
// import { Server } from "http";
// import { Server as SocketIOServer } from "socket.io";
// // socket io setup

// dotenv.config();

// const app: Application = express();
// const PORT = process.env.PORT || 4000;

// // socket io setup
// const server: Server = require("http").createServer(app);
// const io = new SocketIOServer(server, {
//   cors: {
//     origin: "*", // Adjust this for production with specific origins
//     methods: ["GET", "POST"]
//   }
// });
// // socket io setup

// appSetup(app);

// // socket io setup
// io.on("connection", (socket) => {
//   logger.info(`A user connected with socket ID: ${socket.id}`);
//   socket.on("disconnect", () => {
//     logger.info(`User disconnected with socket ID: ${socket.id}`);
//   });
// });
// // socket io setup

// process.on("uncaughtException", (error) => {
//   logger.error("Uncaught Exception:", error);
//   process.exit(1);
// });

// process.on("unhandledRejection", (reason) => {
//   logger.error("Unhandled Promise Rejection:", reason);
//   process.exit(1);
// });

// const startServer = async () => {
//   try {
//     await prisma.$connect();
//     logger.info(`✅ Database connected`);
//     app.listen(PORT, () => {
//       logger.info(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     logger.error("❌ Database connection failed", error);
//     process.exit(1);
//   }
// };

// startServer();

import express, { Application } from "express";
import dotenv from "dotenv";
import logger from "./config/logger";
import prisma from "./config/db";
import appSetup from "./app";

// socket io setup
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
// socket io setup

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// socket io setup
const server: Server = require("http").createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Adjust this for production with specific origins
    methods: ["GET", "POST"]
  }
});
// socket io setup

appSetup(app);

// socket io setup
io.on("connection", (socket) => {
  logger.info(`A user connected with socket ID: ${socket.id}`);

  // Allow client to join a room based on user_id
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined room user_${userId} with socket ID: ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected with socket ID: ${socket.id}`);
  });
});
// socket io setup

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection:", reason);
  process.exit(1);
});

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info(`✅ Database connected`);
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} with Socket.IO`);
    });
  } catch (error) {
    logger.error("❌ Database connection failed", error);
    process.exit(1);
  }
};

startServer();