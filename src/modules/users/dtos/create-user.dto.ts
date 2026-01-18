import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Gender } from '../../../common/enums/users-gender.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  address: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  role?: string;

  @IsOptional()
  company?: string;
}
