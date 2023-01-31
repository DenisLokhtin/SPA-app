import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { CreateCommentDto } from './dto/createComment.dto';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { CommentService } from './comment.service';
import { UpdateRatingDto } from './dto/updateRating.dto';
import validateXHTML from './utils/validateText';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@WebSocketGateway(3070, { namespace: 'comments' })
export class commentGateway implements OnModuleInit {
  constructor(private readonly commentService: CommentService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      this.commentService.getAllComments({}).then((comments) => {
        socket.emit('onFirstConnection', {
          msg: 'allComments',
          comments: comments,
        });
      });
    });
  }

  @SubscribeMessage('getComments')
  async getComments(@ConnectedSocket() socket: Socket): Promise<void> {
    this.commentService
      .getAllComments(socket.handshake.query)
      .then((comments) => {
        this.server.emit('onChangeQuery', {
          msg: 'allComments',
          comments: comments,
        });
      });
  }

  @SubscribeMessage('newComment')
  async onNewComment(
    @MessageBody()
    createCommentDto: CreateCommentDto,
  ): Promise<void> {
    const secretKey = process.env.RECAPTCHA_SECRET as string;
    const recaptchaValidationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${createCommentDto.recaptchaResponse}`;
    const { data } = await axios.post(recaptchaValidationUrl);

    if (!data.success) {
      this.server.emit('onMessage', {
        msg: 'newComment',
        error: 'captcha not valid',
      });
    }
    if (data.success && validateXHTML(createCommentDto.text)) {
      const comment = await this.commentService.createComment(createCommentDto);
      this.server.emit('onMessage', {
        msg: 'newComment',
        comment: comment,
      });
    }
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
