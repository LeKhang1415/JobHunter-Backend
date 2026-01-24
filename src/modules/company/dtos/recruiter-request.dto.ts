import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecruiterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
