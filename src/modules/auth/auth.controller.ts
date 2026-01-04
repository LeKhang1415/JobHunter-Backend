import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUser } from './dtos/register-user.dto';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ResponseMessage('Đăng ký thành công')
  @Post('register')
  async register(@Body() registerUser: RegisterUser) {
    return this.authService.register(registerUser);
  }
}
