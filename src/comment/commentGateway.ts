import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { CreateCommentDto } from './dto/createComment.dto';
import { Server } from 'socket.io';
import { OnModuleInit, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { UpdateRatingDto } from './dto/updateRating.dto';

@WebSocketGateway(3070, { namespace: 'comments' })
export class commentGateway implements OnModuleInit {
  constructor(private readonly commentService: CommentService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      this.commentService.getAllComments().then((comments) => {
        socket.emit('onFirstConnection', {
          msg: 'allComments',
          comments: comments,
        });
      });
    });
  }

  @SubscribeMessage('newComment')
  async onNewComment(
    @MessageBody()
    createCommentDto: CreateCommentDto,
  ): Promise<void> {
    const comment = await this.commentService.createComment(createCommentDto);
    this.server.emit('onMessage', {
      msg: 'newComment',
      comment: comment,
    });
  }

  @SubscribeMessage('changeRating')
  async onRatingChange(
    @MessageBody() updateRatingDto: UpdateRatingDto,
  ): Promise<void> {
    const comment = await this.commentService.changeRating(updateRatingDto);
    this.server.emit('onChangeRating', {
      msg: 'changeRating',
      comment: comment,
    });
  }
}
