import { EnvNames } from "../enum";
import { getEnvVariable } from "../utils";

const {
  JWT_EXPIRES,
  JWT_SECRET,
  JWT_ALGORITHM,
  JWT_SECRET_SERVICES,
  JWT_EXPIRES_SERVICES,
  JWT_ALGORITHM_SERVICES,
} = EnvNames;

export const config = {
  env: process.env.NODE_ENV || "dev",
  tokens: {
    jwt: {
      jwtExpires: getEnvVariable(JWT_EXPIRES),
      jwtSecret: getEnvVariable(JWT_SECRET),
      jwtAlgorithm: getEnvVariable(JWT_ALGORITHM),
    },
    jwtExternal: {
      jwtExpires: getEnvVariable(JWT_EXPIRES_SERVICES),
      jwtSecret: getEnvVariable(JWT_SECRET_SERVICES),
      jwtAlgorithm: getEnvVariable(JWT_ALGORITHM_SERVICES),
    },
  },
};
