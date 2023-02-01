import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { commentGateway } from './comment.gateway';
import { UserEntity } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, UserEntity])],
  providers: [CommentService, commentGateway, UserService],
  controllers: [CommentController],
  exports: [CommentService, UserService],
})
export class CommentModule {}
