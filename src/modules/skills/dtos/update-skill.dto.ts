import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSkillDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
