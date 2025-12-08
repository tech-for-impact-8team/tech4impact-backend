import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RampsService } from './ramps.service';
import { PaginateRampDto } from './dto/paginate-ramp.dto';
import { DeleteRampDto } from './dto/delete-ramp.dto';
import { CreateRampDto } from './dto/create-ramp.dto';
import { UpdateRampDto } from './dto/update-ramp.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { UserDecorator } from '../users/decorator/user.decorator';
import { QueryRunnerDecorator } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { ImagesService } from './image/images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarkersRampDto } from './dto/markers-ramp.dto';

@Controller('ramps')
export class RampsController {
  constructor(
    private readonly rampsService: RampsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get()
  @ApiBearerAuth('authorization')
  getRamps(@Query() query: PaginateRampDto) {
    return this.rampsService.paginateRamps(query);
  }

  @Get('map/markers')
  @ApiBearerAuth('authorization')
  @ApiResponse({ type: MarkersRampDto, isArray: true })
  async getRampMarkers() {
    return this.rampsService.getRampsMarkers();
  }

  @Get(':id')
  @ApiBearerAuth('authorization')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.rampsService.getRampsById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth('authorization')
  @ApiBody({ type: CreateRampDto })
  async postRamp(
    @UserDecorator('id') userId?: number,
    @Body() body?: CreateRampDto,
    @QueryRunnerDecorator() qr?: QR,
  ) {
    const ramp = await this.rampsService.createRamp(userId, body, qr);

    await this.imagesService.createRampImages(ramp, body.imagesKeys, qr);

    return await this.rampsService.getRampsById(ramp.id, qr);
  }

  @Delete()
  @ApiBearerAuth('authorization')
  deleteRamps(@Body() body: DeleteRampDto) {
    return this.rampsService.deleteRamps(body);
  }

  @Patch(':id')
  @ApiBearerAuth('authorization')
  @UseInterceptors(TransactionInterceptor)
  @ApiBody({ type: UpdateRampDto })
  patchRamps(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRampDto,
    @QueryRunnerDecorator() qr?: QR,
  ) {
    return this.rampsService.patchRamps(id, body, qr);
  }

  @Post('random')
  @ApiBearerAuth('authorization')
  async postRandomRamp(@UserDecorator('id') userId?: number) {
    await this.rampsService.generateRamps(userId);
    return { ok: true };
  }

  @Get('analytics')
  @ApiBearerAuth('authorization')
  async getAnalytics() {
    return await this.rampsService.getRampsAnalytics();
  }

  @Post('upload-excel')
  @ApiBearerAuth('authorization')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '엑셀 파일 업로드',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseRampsData(
    @UserDecorator('id') userId?: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.rampsService.parseRampsSheet(userId, file);
    return { ok: true };
  }
}
