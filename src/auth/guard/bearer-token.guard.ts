import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorator/is-public.decorator';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();

    if (isPublic) {
      req.isRoutePublic = true;
      return true;
    }

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken);
    const result = await this.authService.verifyToken(token);

    req.user = await this.usersService.getUserByEmail(result.email);
    req.token = token;
    req.tokenType = result.type;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.isRoutePublic) {
      return true;
    }

    if (req.tokenType !== 'access') {
      throw new UnauthorizedException('AccessToken이 아닙니다.');
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenCookieGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();

    if (isPublic) {
      req.isRoutePublic = true;
      return true;
    }

    const token = req.cookies?.refresh_token;
    if (!token)
      throw new UnauthorizedException('refresh 토큰 쿠키가 없습니다.');

    const decoded = await this.authService.verifyToken(token);
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('refreshToken이 아닙니다.');
    }

    req.user = await this.usersService.getUserByEmail(decoded.email);
    req.token = token;
    req.tokenType = decoded.type;
    return true;
  }
}
