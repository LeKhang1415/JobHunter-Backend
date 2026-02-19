import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUser } from './dtos/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { RoleEnum } from 'src/common/enums/role.enum';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import { Request, Response } from 'express';
import { LoginUser } from './dtos/login-user.dto';
import { HashingProvider } from './providers/hashing.provider';
import { RefreshTokenProvider } from './providers/refresh-token.provider';
import { AuthResponseDto } from './dtos/auth-reponse.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private readonly usersService: UsersService,

    @Inject()
    private readonly roleService: RoleService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(HashingProvider) private readonly hashingProvider: HashingProvider,

    private readonly generateTokenProvider: GenerateTokenProvider,

    private readonly refreshTokenProvider: RefreshTokenProvider,
  ) {}
  async register(registerUser: RegisterUser, response: Response) {
    const { email, name, password, gender, address, recruiter } = registerUser;
    if (await this.usersService.existsByEmail(email)) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashedPassword = await this.hashingProvider.hashPassword(password);

    const newUser = this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      gender,
      address,
    });

    const role = recruiter
      ? await this.roleService.findByName(RoleEnum.RECRUITER)
      : await this.roleService.findByName(RoleEnum.USER);

    if (!role) {
      throw new InternalServerErrorException(
        `System role ${recruiter ? 'RECRUITER' : 'USER'} is missing. Database corrupted.`,
      );
    }

    newUser.role = role;

    const savedUser = await this.usersRepository.save(newUser);

    const permissions = await this.roleService.getPermissionByName(
      savedUser.role.name,
    );

    const accessToken =
      await this.generateTokenProvider.generateTokenWithCookie(
        savedUser,
        permissions,
        response,
      );

    return this.mapToResponseDto(accessToken, savedUser);
  }

  async login(loginUser: LoginUser, response: Response) {
    const existingUser = await this.usersService.findByEmail(loginUser.email);

    if (!existingUser) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    let isEqual = await this.hashingProvider.comparePassword(
      loginUser.password,
      existingUser.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    const permissions = await this.roleService.getPermissionByName(
      existingUser.role.name,
    );

    const accessToken =
      await this.generateTokenProvider.generateTokenWithCookie(
        existingUser,
        permissions,
        response,
      );
    return this.mapToResponseDto(accessToken, existingUser);
  }

  async logout(response: Response): Promise<void> {
    this.generateTokenProvider.clearRefreshTokenCookie(response);
  }

  async refresh(request: Request) {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy RefreshToken');
    }

    const accessToken =
      await this.refreshTokenProvider.refreshAccessToken(refreshToken);

    return { accessToken };
  }

  private mapToResponseDto(accessToken: string, user: User): AuthResponseDto {
    return {
      accessToken,
      user: this.usersService.mapToResponseDto(user),
    };
  }
}
