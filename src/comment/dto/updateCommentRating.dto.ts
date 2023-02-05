import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateCommentRatingDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsEnum([-1, 1])
  @Min(-1)
  @Max(1)
  readonly rating: number;
}
