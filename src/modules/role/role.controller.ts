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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ResponseMessage('Lấy danh sách chức vụ thành công')
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.roleService.findAllRole(pagination);
  }

  @ResponseMessage('Tạo chức vụ thành công')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ResponseMessage('Cập nhật chức vụ thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  //   @ResponseMessage('Xóa chức vụ thành công')
  //   @Delete(':id')
  //   delete(@Param('id') id: string) {
  //     return this.roleService.delete(id);
  //   }
}
