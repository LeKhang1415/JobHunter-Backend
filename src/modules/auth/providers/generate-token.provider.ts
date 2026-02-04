import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';
import jwtConfig from 'src/config/jwt.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signToken<T>(
    userId: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async generateTokenWithCookie(
    user: User,
    permissions: string[],
    response: Response,
  ): Promise<string> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<JwtPayload>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role.name,
          permissions,
        },
      ),

      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    // Set refreshToken vào cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
      path: '/',
    });

    return accessToken;
  }

  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });
  }
}
