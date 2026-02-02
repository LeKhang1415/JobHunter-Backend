import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';

import { SubscriberService } from './subscriber.service';
import { CreateSubscriberDto } from './dtos/create-subscriber.dto';
import { CurrentUser } from 'src/common/decorators/user-infor.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('subscribers')
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @RequirePermissions('GET /subscribers/me')
  @ResponseMessage('Lấy thông tin đăng ký người dùng thành công')
  @Get('me')
  findSelf(@CurrentUser() user: JwtPayload) {
    return this.subscriberService.findSelf(user.email);
  }

  @RequirePermissions('POST /subscribers')
  @ResponseMessage('Đăng ký subscriber thành công')
  @Post()
  create(@Body() dto: CreateSubscriberDto, @CurrentUser() user: JwtPayload) {
    return this.subscriberService.createSelf(user.email, dto);
  }
  @RequirePermissions('PATCH /subscribers/me')
  @ResponseMessage('Cập nhật subscriber thành công')
  @Patch('me')
  update(@Body() dto: CreateSubscriberDto, @CurrentUser() user: JwtPayload) {
    return this.subscriberService.updateSelf(user.email, dto);
  }

  @RequirePermissions('DELETE /subscribers/me')
  @ResponseMessage('Xóa subscriber thành công')
  @Delete('me')
  delete(@CurrentUser() user: JwtPayload) {
    return this.subscriberService.deleteSelf(user.email);
  }
}
