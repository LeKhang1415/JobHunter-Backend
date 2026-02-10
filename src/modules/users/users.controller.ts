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
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions('GET /users')
  @ResponseMessage('Lấy danh sách người dùng thành công')
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.usersService.findAllUsers(pagination);
  }

  @RequirePermissions('GET /users/:id')
  @ResponseMessage('Lấy thông tin người dùng thành công')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @RequirePermissions('POST /users')
  @ResponseMessage('Tạo người dùng thành công')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @RequirePermissions('PATCH /users/:id')
  @ResponseMessage('Cập nhật người dùng thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  //   @RequirePermissions('DELETE /users/:id')
  //   @ResponseMessage('Xóa người dùng thành công')
  //   @Delete(':id')
  //   delete(@Param('id') id: string) {
  //     return this.usersService.deleteUser(id);
  //   }
}
