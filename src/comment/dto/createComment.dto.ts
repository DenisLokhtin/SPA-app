import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../../user/entity/user.entity';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(30)
  readonly text: string;

  @IsString()
  @IsUrl()
  readonly homePage: string;

  @IsNumber()
  parentId: number;

  @IsString()
  @IsNotEmpty()
  readonly recaptchaResponse: string;

  author: UserEntity;
}
