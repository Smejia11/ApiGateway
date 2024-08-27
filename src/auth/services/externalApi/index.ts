import { Service, TargetRouter } from "..";
import { passportConfigurator } from "../..";
import { AuthMiddleware } from "../../../middlewares";
import { apiLimiter } from "../../../middlewares/rate-limit.middleware";

const autMiddlewareStrategyIncExternal = new AuthMiddleware(
  ["jwtICNN", "jwtExternal"],
  passportConfigurator
);
export const externalServices = [
  {
    service: new Service(
      "/external/generateJsonCore",
      new TargetRouter(
        "http://localhost:9087",
        "api",
        "v1",
        "core/generateJsonCore"
      ),
      apiLimiter
    ),
    authenticateMiddleware: autMiddlewareStrategyIncExternal.authenticate,
  },
];
