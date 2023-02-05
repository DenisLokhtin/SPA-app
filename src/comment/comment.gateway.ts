import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { CreateCommentDto } from './dto/createComment.dto';
import { Server, Socket } from 'socket.io';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { UpdateCommentRatingDto } from './dto/updateCommentRating.dto';
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
  event_onChangeRating, event_onError,
  event_onFirstConnection,
  event_onMessage
} from "./utils/constants";
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserService } from '../user/user.service';

dotenv.config();

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const data = host.switchToWs().getData();
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };
    client.emit(event_onError, {
      data: {
        id: (client as any).id,
        rid: data.rid,
        ...details,
      },
    });
  }
}

@WebSocketGateway({ namespace: 'comments' })
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class commentGateway implements OnModuleInit {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;
  socketUsers = {};

  onModuleInit() {
    this.server.on(event_connection, async (socket) => {
      try {
        let user;
        if (!socket.handshake.headers.authorization) {
          user = null;
          socket.disconnect();
        }

        const token = socket.handshake.headers.authorization;
        try {
          const decode = verify(token, process.env.JWT_SECRET) as JwtPayload;
          user = await this.userService.findById(decode.id);
          this.socketUsers[socket.id] = user;
        } catch (error) {
          user = null;
          socket.disconnect();
        }
        if (user === null) socket.disconnect();

        const msg = await this.commentService.getAllComments({});
        socket.emit(event_onFirstConnection, {
          ACTION: action_allComments,
          BODY: msg,
        });
      } catch (e) {
        this.server.emit(event_onFirstConnection, {
          ACTION: action_allComments,
          BODY: {
            error: 500,
            text: 'Critical server error',
            errorMessage: e.message,
          },
        });
      }
    });
  }

  @SubscribeMessage('getComments')
  async getComments(
    @MessageBody() filterCommentDto: FilterCommentDto,
  ): Promise<void> {
    const msg = await this.commentService.getAllComments(filterCommentDto);
    this.server.emit(event_onChangeQuery, {
      ACTION: action_allComments,
      BODY: msg,
    });
  }

  @SubscribeMessage('newComment')
  async onNewComment(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    createCommentDto: CreateCommentDto,
  ): Promise<void> {
    //для тестирования капча была отключена, для её работы нужен ответ присаланный с фронта приложения от гугла

    // const secretKey = process.env.RECAPTCHA_SECRET as string;
    // const recaptchaValidationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${createCommentDto.recaptchaResponse}`;
    // const { data } = await axios.post(recaptchaValidationUrl);

    // if (!data.success) {
    //   this.server.emit(event_onMessage, {
    //     ACTION: action_newComment,
    //     BODY: { error: 498, text: 'captcha not valid' },
    //   });
    // }

    if (validateXHTML(createCommentDto.text)) {
      createCommentDto.author = this.socketUsers[socket.id];
      const msg = await this.commentService.createComment(createCommentDto);
      this.server.emit(event_onMessage, {
        ACTION: action_newComment,
        BODY: msg,
      });
    }
  }

  @SubscribeMessage('changeRating')
  async onRatingChange(
    @ConnectedSocket() socket: Socket,
    @MessageBody() updateRatingDto: UpdateCommentRatingDto,
  ): Promise<void> {
    const user = this.socketUsers[socket.id];
    const msg = await this.commentService.changeRating(updateRatingDto, user);

    this.server.emit(event_onChangeRating, {
      ACTION: action_changeRating,
      BODY: msg,
    });
  }
}
