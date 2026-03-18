import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

export class SkillPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  searchName?: string;
}
