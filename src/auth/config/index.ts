import passport, { Strategy } from "passport";

export interface IPassportConfigurator {
  configurePassport: () => void;
}
type PassportNameStrategyMap = {
  name: string;
  strategy: Strategy;
};
export class PassportConfigurator
  extends passport.Passport
  implements IPassportConfigurator
{
  constructor(private strategies: PassportNameStrategyMap[]) {
    super();
    this.configurePassport = this.configurePassport.bind(this);
  }
  configurePassport() {
    this.strategies.forEach((strategy) => {
      this.use(strategy.name, strategy.strategy);
    });
    return this;
  }
  findStrategy(name: string) {
    const res = this.strategies.find((s) => s.name === name);
    if (!res) throw new Error(`No strategy found with the name ${name}`);
  }
}
