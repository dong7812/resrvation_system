import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
  UploadedFile, UseInterceptors, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateStatusDto, QueryReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: '예약 목록 조회 (상태/검색 필터)' })
  findAll(@Query() query: QueryReservationDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '통계 데이터 조회' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '예약 단건 조회' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '예약 수동 생성' })
  create(@Body() dto: CreateReservationDto) {
    return this.service.create(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Excel 파일로 예약 일괄 등록' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.service.importFromExcel(file.buffer);
  }

  @Get('import/template')
  @ApiOperation({ summary: 'Excel 가져오기 템플릿 다운로드' })
  downloadTemplate(@Res() res: Response) {
    const buffer = this.service.getExcelTemplate();
    res.setHeader('Content-Disposition', 'attachment; filename="reservation_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '예약 상태 변경 (승인/거절)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '예약 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
