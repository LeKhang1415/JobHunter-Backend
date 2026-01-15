import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
