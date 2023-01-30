import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRatingDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsBoolean()
  @IsNotEmpty()
  readonly rating: boolean;
}
