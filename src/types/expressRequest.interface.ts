import { Request } from 'express';
import { UserEntity } from '../user/entity/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: UserEntity;
}
