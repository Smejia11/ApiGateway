import { RateLimitRequestHandler } from "express-rate-limit";

export interface IService {
  route: string;
  target: string;
  rateLimit?: RateLimitRequestHandler;
}

export type IServices = Array<IService>;