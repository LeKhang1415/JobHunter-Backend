import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @RequirePermissions('GET /skills')
  @ResponseMessage('Lấy danh sách kỹ năng thành công')
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.skillsService.findAllSkills(pagination);
  }

  @RequirePermissions('GET /skills/all')
  @ResponseMessage('Lấy toàn bộ kỹ năng (không phân trang) thành công')
  @Get('all')
  findAllWithoutPagination() {
    return this.skillsService.findAllWithoutPagination();
  }

  @RequirePermissions('POST /skills')
  @ResponseMessage('Tạo kỹ năng thành công')
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @ResponseMessage('Cập nhật kỹ năng thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @RequirePermissions('DELETE /skills/:id')
  @ResponseMessage('Xóa kỹ năng thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.skillsService.delete(id);
  }
}
