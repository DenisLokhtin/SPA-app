import { ExpressRequestInterface } from 'src/types/expressRequest.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();
    if (request.user) {
      return true;
    }
    throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
  }
}
