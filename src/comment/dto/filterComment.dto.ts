import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class FilterCommentDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  readonly page: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(['email', 'userName'])
  readonly field: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  readonly sort: string;
}
