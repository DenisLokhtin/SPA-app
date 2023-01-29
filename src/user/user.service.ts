import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './entity/user.entity';
import { sign } from 'jsonwebtoken';
import { LoginUserDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserRepositoryService } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepositoryService: UserRepositoryService) {}

  async findAll() {
    return await this.userRepositoryService.findAll();
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepositoryService.findByEmail(
      createUserDto.email,
    );
    if (userByEmail) {
      throw new HttpException(
        'User already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepositoryService.createUser(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepositoryService.findByEmail(
      loginUserDto.email,
    );
    if (!user) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Password is wrong',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    delete user.password;
    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepositoryService.findById(id);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
