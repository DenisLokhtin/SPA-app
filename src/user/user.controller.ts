import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login.dto';
import { UserEntity } from './entity/user.entity';
import { AuthGuard } from './guards/user.guard';
import { UserDecorator } from './decorator/user.decorator';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'взять всех users' })
  @ApiResponse({
    status: 200,
    description: 'Пример массива',
    schema: {
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'уникальный id',
            example: '42',
          },
          email: {
            type: 'string',
            description: 'емейл',
            example: 'Doe@gmail.com',
          },
          userName: {
            type: 'string',
            description: 'имя пользователя',
            example: 'John Doe',
          },
          password: {
            type: 'string',
            description: 'захешированный пароль',
            example:
              '$2b$10$XLIrX9bp30OijmbyME0M3u17esCFN1WlAoeQ1YeWhnuHTbmTsRk1W',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Post('register')
  @ApiOperation({ summary: 'регистрация' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'емейл',
          example: 'John@gmail.com',
        },
        userName: {
          type: 'string',
          description: 'имя пользователя',
          example: 'John Doe',
        },
        password: {
          type: 'string',
          description: 'пароль',
          example: '123456789',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'успешно создан',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'id',
          example: '42',
        },
        email: {
          type: 'string',
          description: 'емейл',
          example: 'John@gmail.com',
        },
        password: {
          type: 'string',
          description: 'пароль',
          example: '123456789',
        },
        token: {
          type: 'string',
          description: 'token',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZGlzcGxheV9uYW1lIjoiTWVsbmlrIiwiZW1haWwiOiJtZWxuaWtAZ21haWwuY29tIiwiaWF0IjoxNjcxMTc1NzQ1fQ.Djj2kgoTg92XINATm3O_wotPTll99dSNoqhhQqZL3tM',
        },
      },
    },
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  @ApiOperation({ summary: 'вход' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'емейл',
          example: 'John@gmail.com',
        },
        password: {
          type: 'string',
          description: 'пароль',
          example: '123456789',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'вход успешен',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'id',
          example: '42',
        },
        email: {
          type: 'string',
          description: 'емейл',
          example: 'John@gmail.com',
        },
        password: {
          type: 'string',
          description: 'пароль',
          example: '123456789',
        },
        token: {
          type: 'string',
          description: 'token',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZGlzcGxheV9uYW1lIjoiTWVsbmlrIiwiZW1haWwiOiJtZWxuaWtAZ21haWwuY29tIiwiaWF0IjoxNjcxMTc1NzQ1fQ.Djj2kgoTg92XINATm3O_wotPTll99dSNoqhhQqZL3tM',
        },
      },
    },
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('getem')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'взять текущего user' })
  @ApiResponse({
    status: 200,
    description: 'Пример объекта',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'уникальный id',
          example: '42',
        },
        email: {
          type: 'string',
          description: 'емейл',
          example: 'Doe@gmail.com',
        },
        password: {
          type: 'string',
          description: 'захешированный пароль',
          example:
            '$2b$10$XLIrX9bp30OijmbyME0M3u17esCFN1WlAoeQ1YeWhnuHTbmTsRk1W',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  async currentUser(
    @UserDecorator() user: UserEntity,
  ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }
}
