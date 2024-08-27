import { PassportConfigurator } from "./config";
import jwtStrategyExternal from "./strategies/jwt-external.strategy";
import jwtStrategy from "./strategies/jwt.strategy";


export const passportConfigurator = new PassportConfigurator([
  { name: "jwtICNN", strategy: jwtStrategy },
  { name: 'jwtExternal', strategy: jwtStrategyExternal },
]).configurePassport();

