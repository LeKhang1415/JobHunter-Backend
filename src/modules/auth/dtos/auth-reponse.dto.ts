import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
