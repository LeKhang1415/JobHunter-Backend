import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from './dtos/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ResponseMessage('Tạo quyền hạn thành công')
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @ResponseMessage('Cập nhật quyền hạn thành công')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @ResponseMessage('Xóa quyền hạn thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
