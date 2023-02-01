import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class FilterCommentDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly page: number;

  @IsString()
  @IsNotEmpty()
  readonly field: string;

  @IsString()
  @IsNotEmpty()
  readonly sort: string;
}
