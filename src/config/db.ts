import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";

type LogLevel = "info" | "query" | "warn" | "error";

type LogDefinition = {
  emit: "stdout" | "event";
  level: LogLevel;
};

declare global {
  var prisma: PrismaClient | undefined;
}

const logLevels: LogDefinition[] = [
  { emit: "event", level: "query" },
  { emit: "stdout", level: "info" },
  { emit: "stdout", level: "warn" },
  { emit: "stdout", level: "error" },
];

// main prisma client
const prisma =
  global.prisma ||
  new PrismaClient({
    log: logLevels,
  });

// Separate Prisma client for logging (avoids recursion)
// const loggingPrisma = new PrismaClient();

// Prisma Middleware for logging DB changes
// prisma.$use(async (params: any, next: any) => {
//   const result = await next(params);
//   const operation = params.action.toLowerCase();

//   // @ts-ignore
//   prisma.$on("query", async (e: any) => {
//     if (!e.query.startsWith("SELECT")) {
//       try {
//         await loggingPrisma.allActivityLog.create({
//           data: {
//             method: operation,
//             path: params.model || "Unknown",
//             databaseQuery: e.query,
//             payload: JSON.stringify(params.args),
//           },
//         });
//       } catch (err) {
//         logger.error(`Failed to log activity: ${err}`);
//       }
//     }
//   });

//   logger.info(
//     `Prisma Action: Model=${params.model}, Action=${
//       params.action
//     }, Args=${JSON.stringify(params.args)}`
//   );

//   return result;
// });

// Custom log handler for Prisma events
// @ts-ignore
prisma.$on("query", async (e: any) => {
  logger.info(`Prisma Query: ${e.query} - Params: ${e.params}`);
});
// @ts-ignore
prisma.$on("info", (e: any) => {
  logger.info(`Prisma Info: ${e.message}`);
});
// @ts-ignore
prisma.$on("warn", (e: any) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});
// @ts-ignore
prisma.$on("error", (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
