import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { CreateCommentDto } from './dto/createComment.dto';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { CommentService } from './comment.service';
import { UpdateRatingDto } from './dto/updateRating.dto';
import validateXHTML from './utils/validateText';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { FilterCommentDto } from './dto/filterComment.dto';
import {
  action_allComments,
  action_changeRating,
  action_newComment,
  event_connection,
  event_onChangeQuery,
  event_onChangeRating,
  event_onFirstConnection,
  event_onMessage,
} from './utils/constants';

dotenv.config();

@WebSocketGateway(3070, { namespace: 'comments' })
export class commentGateway implements OnModuleInit {
  constructor(private readonly commentService: CommentService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on(event_connection, async (socket) => {
      const msg = await this.commentService.getAllComments({});
      socket.emit(event_onFirstConnection, {
        ACTION: action_allComments,
        BODY: msg,
      });
    });
  }

  @SubscribeMessage('getComments')
  async getComments(
    @MessageBody() filterCommentDto: FilterCommentDto,
  ): Promise<void> {
    try {
      const msg = await this.commentService.getAllComments(filterCommentDto);
      this.server.emit(event_onChangeQuery, {
        ACTION: action_allComments,
        BODY: msg,
      });
    } catch (e) {
      console.log(e);
      this.server.emit(event_onChangeQuery, {
        ACTION: action_allComments,
        BODY: 'Critical server error',
      });
    }
  }

  @SubscribeMessage('newComment')
  async onNewComment(
    @MessageBody()
    createCommentDto: CreateCommentDto,
  ): Promise<void> {
    try {
      const secretKey = process.env.RECAPTCHA_SECRET as string;
      const recaptchaValidationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${createCommentDto.recaptchaResponse}`;
      const { data } = await axios.post(recaptchaValidationUrl);

      if (!data.success) {
        this.server.emit(event_onMessage, {
          ACTION: action_newComment,
          BODY: 'captcha not valid',
        });
      }
      if (data.success && validateXHTML(createCommentDto.text)) {
        const msg = await this.commentService.createComment(createCommentDto);
        this.server.emit(event_onMessage, {
          ACTION: action_newComment,
          BODY: msg,
        });
      }
    } catch (e) {
      console.log(e);
      this.server.emit(event_onMessage, {
        ACTION: action_newComment,
        BODY: 'Critical server error',
      });
    }
  }

  @SubscribeMessage('changeRating')
  async onRatingChange(
    @MessageBody() updateRatingDto: UpdateRatingDto,
  ): Promise<void> {
    try {
      const msg = await this.commentService.changeRating(updateRatingDto);
      this.server.emit(event_onChangeRating, {
        ACTION: action_changeRating,
        BODY: msg,
      });
    } catch (e) {
      console.log(e);
      this.server.emit(event_onChangeRating, {
        ACTION: action_changeRating,
        BODY: 'Critical server error',
      });
    }
  }
}
