import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/common/enums/users-gender.enum';

export class RegisterUser {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu người dùng không được để trống' })
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  address: string;

  recruiter: boolean;
}
