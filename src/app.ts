import express from "express";
import cors from "cors";
import helmet from "helmet";
import v1Routes from "./routes";
import v2Routes from "./routes/v2";
import logger from "./config/logger";
import morgan from "morgan";
import path from "path";
import initializeCronJobs from "./jobs/cronJobs";

export default (app: express.Application): void => {
  app.use(express.json({ limit: "10mb" }));
  app.use(cors());
  app.use(helmet());

  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use(
    morgan(function (tokens, req, res) {
      logger.info(
        `[METHOD]: ${tokens.method(req, res)} [PATH]: ${tokens.url(
          req,
          res
        )} [STATUS]: ${tokens.status(req, res)} [CONTENT_LENGTH]: ${tokens.res(
          req,
          res,
          "content-length"
        )} [RESPONSE_TIME]: ${tokens["response-time"](
          req,
          res
        )} ms [BODY]: ${JSON.stringify(req.body)}`
      );
      return [
        "[METHOD]:",
        tokens.method(req, res),
        "[PATH]:",
        tokens.url(req, res),
        "[STATUS]:",
        tokens.status(req, res),
        "[CONTENT_LENGTH]:",
        tokens.res(req, res, "content-length"),
        "[RESPONSE_TIME]:",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    })
  );

  app.use("/api/v1", v1Routes);
  app.use("/api/v2", v2Routes);

  app.use((req, res, next) => {
    res.status(404).json({ message: "API Route Not Found" });
  });

  initializeCronJobs();

  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      logger.error(
        `Error occurred on request ${req.method} ${req.url}: ${err.message}`
      );
      res.status(500).json({ message: err.message });
    }
  );
};
