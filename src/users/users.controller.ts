import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersModel } from './entities/users.entity';
import { GetUserInfoDto } from './dto/get-user-info.dto';
import { UserDecorator } from './decorator/user.decorator';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';

@ApiTags('유저')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '유저 생성' })
  @ApiBody({
    type: CreateUserRequestDto,
    description: '유저 생성 Request Body',
    required: true,
  })
  @ApiResponse({
    type: UsersModel,
  })
  postUser(@Body() createUserDto: CreateUserRequestDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '유저 정보 조회' })
  @ApiParam({ type: Number, name: 'id', required: true })
  @ApiResponse({
    type: GetUserInfoDto,
  })
  @ApiBearerAuth('authorization')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '유저 정보 삭제' })
  @ApiParam({ type: Number, name: 'id', required: true })
  @ApiResponse({
    type: Number,
    example: '1',
  })
  @ApiBearerAuth('authorization')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Get('me')
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({
    type: GetUserInfoDto,
  })
  @UseGuards(AccessTokenGuard)
  getMe(@UserDecorator('id') userId?: number) {
    return this.usersService.getUser(userId);
  }
}
