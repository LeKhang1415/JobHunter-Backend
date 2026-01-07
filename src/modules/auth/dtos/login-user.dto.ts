import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUser {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu người dùng không được để trống' })
  password: string;
}
