import { RateLimitRequestHandler } from "express-rate-limit";
import { IService } from "../interfaces/services.interface";

export class TargetRouter {
  public targetRouter: string;
  constructor(
    public urlBase: string,
    public api: string,
    public version: string,
    public otherParams: string
  ) {
    if (!(typeof urlBase === "string"))
      throw new TypeError("urlBase must be a string");
    if (!(typeof api === "string")) throw new TypeError("api must be a string");
    if (!(typeof version === "string"))
      throw new TypeError("version must be a string");
    if (!(typeof otherParams === "string"))
      throw new TypeError("otherParams must be a string");
    this.targetRouter = `${this.urlBase}/${this.api}/${this.version}/${this.otherParams}`;
    if (!this.isTargetRouter()) throw new Error("Invalid Target Router");
  }
  private isTargetRouter() {
    return URL.canParse(this.targetRouter);
  }
}
export class Service implements IService {
  public target: string;
  constructor(
    public route: string,
    public targetRouter: TargetRouter,
    public rateLimit?: RateLimitRequestHandler
  ) {
    this.target = this.targetRouter.targetRouter;
  }
}

export class Services {
  public services: Service[] = [];
  constructor(public service: Service) {
    if (!(service instanceof Service)) throw new TypeError("Invalid Service");
    this.services.push(service);
  }
}
