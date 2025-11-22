import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

export const UserDecorator = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        'UserDecorator 데코레이터는 AccessTokenGuard와 함께 사용해야 합니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
