import { Request, Response, NextFunction } from "express";

import { Boom } from "@hapi/boom";
import { ErrorProcessor, JsonErrorHandler } from "../utils/errorProcessor";
import logger from "../logger";
import { config } from "../config";


const { env } = config;
export enum errorsHTTP {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  BadData = 422,
  ServerError = 500,
}

export const msgErrsHTTP: Record<number, string> = {
  [errorsHTTP.BadRequest]: "Bad Request",
  [errorsHTTP.Unauthorized]: "Unauthorized",
  [errorsHTTP.Forbidden]: "Forbidden",
  [errorsHTTP.NotFound]: "Not Found",
  [errorsHTTP.ServerError]: "Server Error",
  [errorsHTTP.BadData]: "Bad data",
};

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const id = req.id || null;
  if (err instanceof Error) {
    const jsonError: JsonErrorHandler = {
      message: err.message,
      typeError: msgErrsHTTP[errorsHTTP.ServerError],
      statusCode: errorsHTTP.ServerError,
      idRequest: id,
      timestamp: new Date(new Date().getTime() - 5 * 60 * 60 * 1000),
    };
    const stack = err.stack ?? "not stack";
    if (["dev", "uat"].includes(env)) jsonError.stack = stack;
    logger.error(
      `idRequest:${id} Error captured in middleware error-handler ${JSON.stringify(
        jsonError
      )}, stack: ${stack}`
    );
    new ErrorProcessor(
      res,
      jsonError,
      stack,
      req,
      errorsHTTP.ServerError
    ).processError();
  } else {
    const jsonError: JsonErrorHandler = {
      message: JSON.stringify(err ?? "ERR_UNKNOWN"),
      typeError: msgErrsHTTP[errorsHTTP.ServerError],
      statusCode: errorsHTTP.ServerError,
      idRequest: id,
      timestamp: new Date(new Date().getTime() - 5 * 60 * 60 * 1000),
    };
    new ErrorProcessor(
      res,
      jsonError,
      "stack not defined",
      req,
      errorsHTTP.ServerError
    ).processError();
  }
}

function boomErrorHandler(
  err: Boom,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!err.isBoom) return next(err);
  const { output } = err as Boom;
  const id = req.id || null;
  const jsonError: JsonErrorHandler = {
    message: err.message,
    statusCode: output.statusCode,
    typeError: output.payload.error,
    idRequest: id,
    timestamp: new Date(new Date().getTime() - 5 * 60 * 60 * 1000),
  };
  const stack = err.stack ?? "stack not defined";
  if (["dev", "uat"].includes(env)) jsonError.stack = stack;
  logger.error(
    `idRequest:${id} Error captured in middleware boom-error-handler`,
    jsonError
  );
  new ErrorProcessor(
    res,
    jsonError,
    stack,
    req,
    output.statusCode
  ).processError();
}

export { errorHandler, boomErrorHandler };
