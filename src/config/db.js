"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../config/logger"));
const logLevels = [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
];
// main prisma client
const prisma = global.prisma ||
    new client_1.PrismaClient({
        log: logLevels,
    });
// Separate Prisma client for logging (avoids recursion)
const loggingPrisma = new client_1.PrismaClient();
// Prisma Middleware for logging DB changes
prisma.$use((params, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield next(params);
    const operation = params.action.toLowerCase();
    // @ts-ignore
    prisma.$on("query", (e) => __awaiter(void 0, void 0, void 0, function* () {
        if (!e.query.startsWith("SELECT")) {
            try {
                yield loggingPrisma.allActivityLog.create({
                    data: {
                        method: operation,
                        path: params.model || "Unknown",
                        databaseQuery: e.query,
                        payload: JSON.stringify(params.args),
                    },
                });
            }
            catch (err) {
                logger_1.default.error(`Failed to log activity: ${err}`);
            }
        }
    }));
    logger_1.default.info(`Prisma Action: Model=${params.model}, Action=${params.action}, Args=${JSON.stringify(params.args)}`);
    return result;
}));
// Custom log handler for Prisma events
// @ts-ignore
prisma.$on("query", (e) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Prisma Query: ${e.query} - Params: ${e.params}`);
}));
// @ts-ignore
prisma.$on("info", (e) => {
    logger_1.default.info(`Prisma Info: ${e.message}`);
});
// @ts-ignore
prisma.$on("warn", (e) => {
    logger_1.default.warn(`Prisma Warning: ${e.message}`);
});
// @ts-ignore
prisma.$on("error", (e) => {
    logger_1.default.error(`Prisma Error: ${e.message}`);
});
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
exports.default = prisma;
