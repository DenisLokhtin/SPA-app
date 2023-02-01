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
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly userName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  readonly password: string;
}
