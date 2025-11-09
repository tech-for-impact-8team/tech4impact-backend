import { PickType } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../../users/dto/create-user-request.dto';
import { IsNumber } from 'class-validator';

export class ExistUserDto extends PickType(CreateUserRequestDto, [
  'email',
  'password',
]) {
  @IsNumber()
  id: number;
}
