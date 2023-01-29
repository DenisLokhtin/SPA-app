import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserRepositoryService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll() {
    return await this.userRepo.find();
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOneBy({
      email: email,
    });
  }

  async createUser(newUser: UserEntity): Promise<UserEntity> {
    return await this.userRepo.save(newUser);
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: { id: id },
      relations: ['cards', 'comments', 'columns'],
    });
  }
}
