import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IsPublic } from './common/decorator/is-public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IsPublic()
  @Get('test')
  @ApiBearerAuth('authorization')
  test(): string {
    return this.appService.getHello();
  }
}
