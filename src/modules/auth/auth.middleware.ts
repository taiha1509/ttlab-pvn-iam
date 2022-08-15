import { NestMiddleware } from '@nestjs/common';
import { IRefreshTokenRequest } from './auth.type';
import { NextFunction, Response } from 'express';

export class RefreshTokenMiddleWare implements NestMiddleware {
    use(req: IRefreshTokenRequest, res: Response, next: NextFunction) {
        return next();
    }
}
