import { CreateUserRequestDto } from '../../users/dto/create-user-request.dto';
import { PickType } from '@nestjs/swagger';

export class LoginUserDto extends PickType(CreateUserRequestDto, [
  'email',
  'password',
]) {}
