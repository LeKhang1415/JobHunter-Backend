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
import { RequirePermissions } from 'src/common/decorators/permission.decorator';
import { RolePaginationQueryDto } from './dtos/role-pagination-query.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermissions('GET /role/:id/permissions')
  @ResponseMessage('Lấy quyền theo chức vụ thành công')
  @Get(':id/permissions')
  getPermissionsByRole(@Param('id') id: string) {
    return this.roleService.getPermissionById(id);
  }

  @RequirePermissions('GET /role')
  @ResponseMessage('Lấy danh sách chức vụ thành công')
  @Get()
  findAll(@Query() rolePagination: RolePaginationQueryDto) {
    return this.roleService.findAllRole(rolePagination);
  }

  @RequirePermissions('POST /role')
  @ResponseMessage('Tạo chức vụ thành công')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @RequirePermissions('PATCH /role/:id')
  @ResponseMessage('Cập nhật chức vụ thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @RequirePermissions('DELETE /role/:id')
  @ResponseMessage('Xóa chức vụ thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
