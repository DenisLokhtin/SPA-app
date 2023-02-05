import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateCommentRatingDto } from './dto/updateCommentRating.dto';
import { UserEntity } from '../user/entity/user.entity';
import { RateUsersEntity } from './entity/rateUsers.entity';
import dataSource from '../../db/data-source';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(RateUsersEntity)
    private readonly rateRepository: Repository<RateUsersEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity | { text: string; error: number }> {
    if (createCommentDto.parentId) {
      createCommentDto.parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });
    }

    return await this.commentRepository.save(createCommentDto);
  }

  async getAllComments(query): Promise<CommentEntity[]> {
    const page = query.page || 0;
    const take = 25 + 25 * page;
    const skip = 25 * page;
    const sort = query.sort || 'DESC';
    const field = query.field
      ? { author: { [query.field]: sort } }
      : { created_at: sort };

    return await this.commentRepository.find({
      where: { parent: false },
      relations: { children: true, author: true },
      order: field,
      take: take,
      skip: skip,
    });
  }

  // Существовал вариант с предзагрузкой файла на сервер, к сообщению бы просто прикреплялось id файла.
  async uploadFile(file: string, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) throw new NotFoundException('comment not found');

    if (comment.file !== null) throw new BadRequestException('file not send');

    await this.commentRepository.update({ id: id }, { file: `/files/${file}` });
    return `/files/${file}`;
  }

  async changeRating(
    updateRatingDto: UpdateCommentRatingDto,
    user: UserEntity,
  ): Promise<CommentEntity> {
    const dtoRating = updateRatingDto.rating;
    const dtoId = updateRatingDto.id;
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = await queryRunner.manager.findOne(CommentEntity, {
        where: { id: dtoId },
      });

      if (!comment) throw new NotFoundException('comment not found');

      let userRate = await queryRunner.manager.findOne(RateUsersEntity, {
        where: { user: { id: user.id }, comment: { id: comment.id } },
      });

      if (!userRate) {
        const newRate = new RateUsersEntity();
        newRate.comment = comment;
        newRate.user = user;
        newRate.rating = dtoRating;

        const rate = await queryRunner.manager.save(newRate);

        comment.rating += dtoRating;
        userRate = rate;
      } else if (dtoRating === userRate.rating) {
        throw new BadRequestException('same rate already exists');
      } else {
        userRate.rating = dtoRating;
        comment.rating += dtoRating;
      }

      await queryRunner.manager.save(userRate);
      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();

      return comment;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
