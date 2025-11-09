import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IsPublic } from '../common/decorator/is-public.decorator';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { RefreshTokenCookieGuard } from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @IsPublic()
  @ApiOperation({
    summary: '회원가입',
  })
  async signUp(
    @Body() body: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.registerUser(body);
    this.authService.setRefreshCookie(res, refresh_token);
    return { access_token };
  }

  @Post('sign-in')
  @IsPublic()
  @ApiOperation({
    summary: '로그인',
  })
  async signIn(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.loginWithEmail(body);
    this.authService.setRefreshCookie(res, refresh_token);
    return { access_token };
  }

  @Post('reissue-token')
  @IsPublic()
  @UseGuards(RefreshTokenCookieGuard)
  @ApiOperation({ summary: '액세스/리프레시 토큰 재발급' })
  @ApiCookieAuth('refresh_token')
  async reissue(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { access_token, refresh_token } =
      await this.authService.rotateTokensByRefresh(
        req.cookies['refresh_token'],
      );

    this.authService.setRefreshCookie(res, refresh_token);

    return { access_token };
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiCookieAuth('refresh_token')
  @ApiBearerAuth('authorization')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearRefreshCookie(res);
    return { ok: true };
  }
}
