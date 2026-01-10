import { IsEnum, IsOptional, IsString } from 'class-validator';
import { HttpMethod } from '../enums/http-method.permission';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  module: string;

  @IsString()
  apiPath: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsOptional()
  @IsString()
  description?: string;
}
