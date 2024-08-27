import express, { NextFunction, Request, Response } from "express";
import "./auth";

import { Server } from "http";
// Swagger
import swaggerUI from "swagger-ui-express";
import logger from "./logger";

export type HandlerError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/** The `export class App` is defining a class called `App` that represents the Express application. It
has various methods and properties to configure and start the application. It also includes
middleware functions for compression, security headers, permission validation, request body parsing,
logging, CORS, caching, and routing. Additionally, it sets up error handling middleware and Swagger
documentation for the app. */
export class App {
  private static appInstance: express.Application;
  private server!: Server;
  constructor(
    public app: express.Application,
    private port: number,
    private run: string,
    private middlewares: express.Handler[],
    cronJobs?: () => void,
    specs?: object
  ) {
    this.app = express();
    this.port = +port;
    this.run = run;
    this.middlewares = middlewares;
    if (specs) this.configSwaggerJsDoc(specs);
    this.config(cronJobs);
  }

  /**
   * The function `instance` returns the `appInstance` of the `App` class in TypeScript.
   * @returns The `instance` method is returning the `appInstance` of the `App` class, which is an
   * instance of the Express application.
   */
  public static get instance() {
    App.appInstance = express();
    return App.appInstance;
  }

  /**
   * @param [initTasks] - The `initTasks` parameter in the `config` method is an optional parameter that
   * expects a function as its value. This function is used to initialize any tasks that need to be
   * performed when the configuration is set up. If provided, the `initTasks` function will be called
   * within the `config
   */
  public config(initTasks?: () => void): void {
    // *? Use the middlewares
    this.middlewares.forEach((middleware) => {
      this.app.use(middleware);
    });
    this.app.disable("x-powered-by");
    this.app.set("trust proxy", 1);
    // *? Define cache
    // *? define periodic tasks
    if (initTasks) initTasks();
    // *? init routes
  }

  /**
   * The start function starts the application and listens for incoming requests on a specified port.
   */
  public start() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`run ${this.run} port: ${this.port}`);
    });
    return this.server;
  }

  public close() {
    this.server.close(() => {
      logger.info("Express server closed");
    });
  }

  /**
   * The function configSwaggerJsDoc sets up Swagger documentation for an Express app.
   */
  public configSwaggerJsDoc(specs: object) {
    this.app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
  }
}
