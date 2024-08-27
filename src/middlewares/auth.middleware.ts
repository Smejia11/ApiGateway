import boom from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
import { PassportConfigurator } from '../auth/config';

function checkAdminRole(req: Request, res: Response, next: NextFunction) {
  const user: any = req.headers.user;
  if (user.role === 'admin') {
    next();
  } else {
    next(boom.forbidden('se requieren permisos de administrador'));
  }
}

function checkRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.headers.user;
    if (roles.includes(user.role)) {
      next();
    } else {
      next(boom.unauthorized('no estas autorizado'));
    }
  };
}

export class AuthMiddleware {
  constructor(
    private strategyName:
      | 'jwtICNN'
      | 'jwtExternal'
      | ['jwtICNN', 'jwtExternal']
      | string
      | string[],
    private passportConfigurator: PassportConfigurator,
  ) {
    this.authenticate = this.authenticate.bind(this);
  }

  async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    this.passportConfigurator.authenticate(
      this.strategyName,
      { session: false },
      (
        error: { message: string | Error | null | undefined } | null,
        user: Express.User | undefined,
        info:
          | { message: string | Error | null | undefined }
          | Array<{ message: string | Error | null | undefined }>
          | null,
      ) => {
        if (error) return next(boom.unauthorized(error.message));
        if (!user) {
          if (info && info instanceof Error)
            return next(boom.unauthorized(info.message));
          else if (info) {
            if (Array.isArray(info))
              return next(boom.unauthorized(info.join()));
            return next(boom.unauthorized(info.message));
          } else return next(boom.unauthorized());
        }

        req.user = user;
        next();
      },
    )(req, res, next);
  }
}

export {
  // checkApiKey,
  checkAdminRole,
  checkRoles,
};
