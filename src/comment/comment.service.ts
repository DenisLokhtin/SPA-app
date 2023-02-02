import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateCommentRatingDto } from './dto/updateCommentRating.dto';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const comment = await this.commentRepository.create(createCommentDto);

    if (createCommentDto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });

      comment.parent = await parent;
    }
    return await this.commentRepository.save(comment);
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
  async uploadFile(
    file: string,
    id: number,
  ): Promise<string | { text: string; error: number }> {
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) return { error: 404, text: 'comment not found' };

    if (comment.file !== null) return { error: 407, text: 'file not exist' };

    await this.commentRepository.update({ id: id }, { file: `/files/${file}` });
    return `/files/${file}`;
  }

  async changeRating(
    updateRatingDto: UpdateCommentRatingDto,
    user: UserEntity,
  ): Promise<{ text: string; error: number } | CommentEntity> {
    const id = updateRatingDto.id;
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: { ratingDown: true, ratingUp: true },
    });

    if (!comment) return { error: 404, text: 'comment not found' };

    const ratingUpUsers = comment.ratingUp.map((user) => user.id);
    const ratingDownUsers = comment.ratingDown.map((user) => user.id);

    // если comment.rating правдивый – то рейтинг повышается, если ложный – то понижается.

    if (updateRatingDto.rating) {
      if (!ratingUpUsers.includes(user.id)) {
        comment.ratingUp.push(user);
        await this.commentRepository.update(
          { id: id },
          { rating: (comment.rating += 1) },
        );
        return await this.commentRepository.save(comment);
      }
      return { error: 407, text: 'positive rate already exist' };
    } else {
      if (!ratingDownUsers.includes(user.id)) {
        comment.ratingDown.push(user);
        await this.commentRepository.update(
          { id: id },
          { rating: (comment.rating -= 1) },
        );
        return await this.commentRepository.save(comment);
      }
      return { error: 407, text: 'negative rate already exist' };
    }
  }
}
