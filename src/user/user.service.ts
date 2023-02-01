import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './entity/user.entity';
import { sign } from 'jsonwebtoken';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll() {
    return await this.userRepo.find();
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepo.findOneBy({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepo.findOneBy({
      userName: createUserDto.userName,
    });
    if (userByEmail || userByUsername) {
      throw new HttpException(
        'User already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepo.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepo.find({
      select: {
        id: true,
        userName: true,
        email: true,
        password: true,
      },
      where: { email: loginUserDto.email },
    });
    if (!user.length) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user[0].password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Password is wrong',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    delete user[0].password;
    return user[0];
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepo.findOneBy({ id: id });
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        userName: user.userName,
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
