import { IsArray, IsOptional, ValidateNested } from 'class-validator';

export class CreateSubscriberDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  skills?: string[];
}
