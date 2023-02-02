import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCommentRatingDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsBoolean()
  @IsNotEmpty()
  readonly rating: boolean;
}
