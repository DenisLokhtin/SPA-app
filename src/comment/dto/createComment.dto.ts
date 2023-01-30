import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

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
  readonly parentId: number;

  @IsNumber()
  readonly childId: number;
}
