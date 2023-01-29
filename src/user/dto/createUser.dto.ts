import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'email',
    example: 'JohnDoe@gmail.com',
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({
    description: 'username',
    example: 'John Doe',
  })
  readonly userName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @ApiProperty({
    description: 'пароль',
    example: '12345678',
  })
  readonly password: string;
}
