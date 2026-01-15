import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RequirePermissions('GET /permissions')
  @ResponseMessage('Lấy danh sách quyền hạn thành công')
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.permissionsService.findAllPermission(pagination);
  }

  @RequirePermissions('GET /permissions/all')
  @Get('all')
  @ResponseMessage('Lấy toàn bộ quyền hạn (không phân trang) thành công')
  findAllWithoutPagination() {
    return this.permissionsService.findAllWithoutPagination();
  }

  @RequirePermissions('POST /permissions')
  @ResponseMessage('Tạo quyền hạn thành công')
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @RequirePermissions('PATCH /permissions/:id')
  @ResponseMessage('Cập nhật quyền hạn thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @RequirePermissions('DELETE /permissions/:id')
  @ResponseMessage('Xóa quyền hạn thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
