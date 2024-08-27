import { Request, Response } from "express";
import logger from "../logger";

export interface JsonErrorHandler {
  message: string;
  stack?: string;
  typeError: string;
  statusCode: number;
  idRequest?: any;
  timestamp: Date;
}

export class ErrorProcessor {
  constructor(
    private res: Response,
    private jsonError: JsonErrorHandler,
    private stack: string,
    private req: Request,
    private statusCode: number
  ) {}

  public processError(): void {
    try {
      !this.res.closed
        ? this.res.status(this.statusCode).json(this.jsonError)
        : null;
    } catch (error) {
      if (error instanceof Error) logger.error(`Error`, error);
      else logger.fatal(`error uncontrolled`, { error });
    }
  }
}
