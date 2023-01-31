import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { CommentEntity } from "../entity/comment.entity";

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(30)
  readonly text: string;

  @IsString()
  @IsUrl()
  readonly homePage: string;

  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNumber()
  parentId: number;

  @IsString()
  @IsNotEmpty()
  readonly recaptchaResponse: string;
}
