import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateRatingDto } from './dto/updateRating.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<{ text: string; email: string } & CommentEntity> {
    const comment = await this.commentRepository.create(createCommentDto);
    const parent = await this.commentRepository.findOne({
      where: { id: createCommentDto.parentId },
    });

    if (!createCommentDto.parentId || parent) comment.parent = await parent;

    return await this.commentRepository.save(comment);
  }

  async getAllComments(query): Promise<CommentEntity[]> {
    const page = query.page || 0;
    const take = 25 + 25 * page;
    const skip = 25 * page;
    const sort = query.sort || 'DESC';
    const field = query.field || 'created_at';

    return await this.commentRepository.find({
      where: { parent: false },
      relations: { children: true },
      order: { [field]: sort },
      take: take,
      skip: skip,
    });
  }

  // Существовал вариант с предзагрузкой файла на сервер, к сообщению бы просто прикреплялось id файла.
  async uploadFile(file: string, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) return 'comment not found';

    if (comment.file !== null) return 'file is exist';

    await this.commentRepository.update({ id: id }, { file: `/files/${file}` });
    return `/files/${file}`;
  }

  async changeRating(
    updateRatingDto: UpdateRatingDto,
  ): Promise<string | CommentEntity> {
    const id = updateRatingDto.id;
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) return 'comment not found';

    // если comment.rating правдивый – то рейтинг повышается, если ложный – то понижается.

    await this.commentRepository.update(
      { id: id },
      updateRatingDto.rating
        ? { rating: (comment.rating += 1) }
        : { rating: (comment.rating -= 1) },
    );

    return await this.commentRepository.findOne({ where: { id: id } });
  }
}
