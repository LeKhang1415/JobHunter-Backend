import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

export class RolePaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
}
