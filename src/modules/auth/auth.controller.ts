import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { RegisterUser } from './dtos/register-user.dto';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginUser } from './dtos/login-user.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Đăng ký thành công')
  @Post('register')
  async register(
    @Body() registerUser: RegisterUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(registerUser, response);
  }

  @Public()
  @ResponseMessage('Đăng nhập thành công')
  @Post('login')
  async login(
    @Body() loginUser: LoginUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginUser, response);
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() request: Request) {
    return this.authService.refresh(request);
  }

  @ResponseMessage('Đăng xuất thành công')
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    await this.authService.logout(response);
    return null;
  }
}
