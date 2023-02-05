import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  readonly homePage: string;

  @IsNumber()
  @IsOptional()
  parentId: number;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  readonly recaptchaResponse: string;

  @IsOptional()
  author: UserEntity;

  @IsOptional()
  parent: any;
}
