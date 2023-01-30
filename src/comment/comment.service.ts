import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { UpdateRatingDto } from './dto/updateRating.dto';
import fs from 'fs';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentRepository.save(createCommentDto);
  }

  async getAllComments(): Promise<CommentEntity[]> {
    return await this.commentRepository.find();
  }

  async uploadFile(file: string, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) throw new NotFoundException('comment not found');

    if (comment.file !== null) throw new ConflictException('file is exist');

    await this.commentRepository.update({ id: id }, { file: `/files/${file}` });
    return `/files/${file}`;
  }

  async changeRating(updateRatingDto: UpdateRatingDto): Promise<CommentEntity> {
    const id = updateRatingDto.id;
    const comment = await this.commentRepository.findOne({ where: { id: id } });

    if (!comment) throw new NotFoundException('comment not found');

    await this.commentRepository.update(
      { id: id },
      updateRatingDto.rating
        ? { rating: (comment.rating += 1) }
        : { rating: (comment.rating -= 1) },
    );

    return await this.commentRepository.findOne({ where: { id: id } });
  }
}
