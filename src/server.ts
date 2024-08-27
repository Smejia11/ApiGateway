import express from "express";
import helmet from "helmet";
import { App } from "./app";
import logger from "./logger";
import compression from "compression";
import {
  helmetOptions,
  loggerMiddleware,
  validatePermissionPolicy,
} from "./middlewares";
import cors, { CorsOptions } from "cors";
import responseTime from "response-time";
import boom from "@hapi/boom";
import { externalServices } from "./auth/services/externalApi";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  boomErrorHandler,
  errorHandler,
} from "./middlewares/error-handler.middleware";

const whiteList = ["http://localhost:3004"];

const optionsCors: CorsOptions = {
  origin: (origin: any, callback) => {
    if (whiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(boom.unauthorized("Not allowed client"));
    }
  },
};
const middlewares = [
  compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
      const noCompression = req.headers["x-no-compression"];
      if (noCompression) return false;
      return compression.filter(req, res);
    },
  }),
  responseTime(),
  helmet(helmetOptions),
  validatePermissionPolicy,
  express.json({ limit: "5mb" }),
  express.urlencoded({ extended: true }),
  loggerMiddleware(),
  cors(optionsCors),
];
const app = new App(
  express(),
  9091,
  process.env.NODE_ENV as string,
  middlewares
);

externalServices.forEach(({ service, authenticateMiddleware }) => {
  // Proxy options
  const proxyOptions = {
    target: "http://localhost:9087",
    changeOrigin: true,
    pathRewrite: {
      [`^${service.route}`]: "/api/v1/core/generateJsonCore",
    },
    on: {
      proxyReq: (proxyReq: any, req: any, res: any) => {
        logger.info(`Proxying request to`, proxyReq);
        /* handle proxyReq */
      },
      proxyRes: (proxyRes: any, req: any, res: any) => {
        logger.info(`Received response from ${service.target}`);
        /* handle proxyRes */
      },
      error: (err: any, req: any, res: any) => {
        /* handle error */
      },
      logLevel: logger.info,
    },
  };
  if (service.rateLimit)
    app.app.use(
      service.route,
      service.rateLimit,
      authenticateMiddleware,
      createProxyMiddleware(proxyOptions)
    );
  else
    app.app.use(
      service.route,
      authenticateMiddleware,
      createProxyMiddleware(proxyOptions)
    );
});

app.app.use((_req, res, next) => {
  next(boom.notFound("Route not found."));
});

app.app.use(boomErrorHandler);
app.app.use(errorHandler);

const server = app.start();

process.on("uncaughtException", (err) => {
  // log the exception
  logger.fatal(err, "uncaught exception detected");
  // shutdown the server gracefully
  server.close(() => {
    process.exit(1); // then exit
  });

  // If a graceful shutdown is not achieved after 1 second,
  // shut down the process completely
  setTimeout(() => {
    process.abort(); // exit immediately and generate a core dump file
  }, 1000).unref();
  process.exit(1);
});
