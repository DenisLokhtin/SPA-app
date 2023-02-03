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
  ): Promise<CommentEntity | { text: string; error: number }> {
    if (
      createCommentDto.text === undefined ||
      (createCommentDto.text === '' && createCommentDto.text.length < 30)
    )
      return { error: 407, text: 'text is empty' };

    if (
      createCommentDto.parentId !== undefined &&
      createCommentDto.parentId < 0
    )
      return { error: 407, text: 'parentId is empty' };

    const comment = await this.commentRepository.create(createCommentDto);

    if (createCommentDto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });

      comment.parent = await parent;
    }
    return await this.commentRepository.save(comment);
  }

  async getAllComments(
    query,
  ): Promise<CommentEntity[] | { text: string; error: number }> {
    if (
      query.sort !== undefined &&
      query.sort !== 'DESC' &&
      query.sort !== 'ASC'
    )
      return { error: 407, text: 'query sort not correct' };

    if (
      query.field !== undefined &&
      query.field !== 'email' &&
      query.field !== 'userName' &&
      query.field !== 'created_at'
    )
      return { error: 407, text: 'query field not correct' };

    if (query.page !== undefined && query.page < 0)
      return { error: 407, text: 'query page not correct' };

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
    if (
      updateRatingDto === undefined ||
      updateRatingDto.id === undefined ||
      isNaN(updateRatingDto.id) ||
      updateRatingDto.id < 0
    )
      return { error: 407, text: 'not correct body' };

    const id = updateRatingDto.id;
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: { ratingDown: true, ratingUp: true },
    });

    if (!comment) return { error: 404, text: 'comment not found' };

    const ratingUpUsers = comment.ratingUp.map((user) => user.id);
    const ratingDownUsers = comment.ratingDown.map((user) => user.id);

    // если updateRatingDto.rating правдивый – то рейтинг повышается, если ложный – то понижается.

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
