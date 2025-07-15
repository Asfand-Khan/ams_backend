"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./config/logger"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
exports.default = (app) => {
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
    app.use((0, morgan_1.default)(function (tokens, req, res) {
        logger_1.default.info(`[METHOD]: ${tokens.method(req, res)} [PATH]: ${tokens.url(req, res)} [STATUS]: ${tokens.status(req, res)} [CONTENT_LENGTH]: ${tokens.res(req, res, "content-length")} [RESPONSE_TIME]: ${tokens["response-time"](req, res)} ms [BODY]: ${JSON.stringify(req.body)}`);
        return [
            '[METHOD]:',
            tokens.method(req, res),
            '[PATH]:',
            tokens.url(req, res),
            '[STATUS]:',
            tokens.status(req, res),
            '[CONTENT_LENGTH]:',
            tokens.res(req, res, "content-length"),
            '[RESPONSE_TIME]:',
            tokens["response-time"](req, res),
            "ms",
        ].join(" ");
    }));
    app.use("/api/v1", routes_1.default);
    app.use((err, req, res, next) => {
        logger_1.default.error(`Error occurred on request ${req.method} ${req.url}: ${err.message}`);
        res.status(500).json({ message: err.message });
    });
};
