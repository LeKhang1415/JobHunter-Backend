import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Level } from 'src/common/enums/level.enum';

export class CreateJobDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  salary: number;

  @IsNumber()
  quantity: number;

  @IsEnum(Level)
  level: Level;

  @IsString()
  description: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsBoolean()
  active: boolean;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsArray()
  @IsUUID()
  skillIds: string[];
}
