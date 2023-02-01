import { UserEntity } from '../entity/user.entity';

export type UserType = Omit<UserEntity, 'hashPassword'>;
