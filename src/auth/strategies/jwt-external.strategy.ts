import { Strategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { config } from '../../config';

const {
  tokens: {
    jwtExternal: { jwtSecret, jwtAlgorithm },
  },
} = config;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  algorithms: [jwtAlgorithm],
} as StrategyOptionsWithoutRequest;

const jwtStrategyExternal = new Strategy(options, (payload, done) =>
  done(null, payload),
);

export default jwtStrategyExternal;
