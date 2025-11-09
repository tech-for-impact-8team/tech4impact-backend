import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRED,
  JWT_SECRET,
  REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRED,
} from './const/token';
import { ExistUserDto } from './dto/exist-user.dto';
import { Response } from 'express';
import { toMs } from '../common/utils/duration';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  getRefreshCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const raw = this.configService.get<string>(REFRESH_TOKEN_EXPIRED); // '7d'
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd
        ? 'none'
        : ('lax' as boolean | 'none' | 'lax' | 'strict'),
      maxAge: toMs(raw, 7 * 24 * 60 * 60 * 1000), // 기본 7일
    };
  }

  signToken(user: ExistUserDto, isRefresh: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefresh ? REFRESH_TOKEN : ACCESS_TOKEN,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(JWT_SECRET),
      expiresIn: isRefresh
        ? this.configService.get(REFRESH_TOKEN_EXPIRED)
        : this.configService.get(ACCESS_TOKEN_EXPIRED),
    });
  }

  async registerUser(body: RegisterUserDto) {
    const hash = await bcrypt.hash(
      body.password,
      parseInt(this.configService.get<string>(process.env.HASH_ROUNDS)),
    );

    const newUser = await this.usersService.createUser({
      ...body,
      password: hash,
    });

    return this.buildLoginTokens(newUser);
  }

  extractTokenFromHeader(header: string) {
    if (!header) {
      throw new UnauthorizedException('액세스 토큰이 존재하지 않습니다.');
    }

    const splitToken = header.split(' ');
    const hasPrefix = splitToken[0] === 'Bearer';

    if (!hasPrefix || splitToken.length !== 2) {
      throw new UnauthorizedException('올바르지 않은 토큰입니다.');
    }

    return splitToken[1];
  }

  async loginWithEmail(user: { email: string; password: string }) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.buildLoginTokens(existingUser);
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(JWT_SECRET),
      });
    } catch (e) {
      throw new UnauthorizedException(
        `${e} - 토큰이 만료되었거나 잘못된 토큰입니다.`,
      );
    }
  }

  async rotateTokensByRefresh(refreshToken: string) {
    const decoded = await this.verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰으로만 가능합니다.',
      );
    }

    // 안전하게 사용자 확인(탈퇴/정지 등 케이스)
    const user = await this.usersService.getUserByEmail(decoded.email);
    if (!user || user.id !== decoded.sub) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    const newAccess = this.signToken(
      { email: user.email, password: user.password, id: user.id },
      false,
    );
    const newRefresh = this.signToken(
      { email: user.email, password: user.password, id: user.id },
      true,
    );

    return { access_token: newAccess, refresh_token: newRefresh };
  }

  setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, this.getRefreshCookieOptions());
  }

  clearRefreshCookie(res: Response) {
    res.clearCookie('refresh_token', {
      ...this.getRefreshCookieOptions(),
      maxAge: 0,
    });
  }

  private async authenticateWithEmailAndPassword(
    user: Pick<LoginUserDto, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }

    return existingUser;
  }

  private buildLoginTokens(user: ExistUserDto) {
    const accessToken = this.signToken(user, false);
    const refreshToken = this.signToken(user, true);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
