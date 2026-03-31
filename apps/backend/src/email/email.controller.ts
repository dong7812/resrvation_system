import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly aiService: AiService,
  ) {}

  @Post('fetch')
  @ApiOperation({ summary: '이메일 수동 폴링 트리거' })
  async fetchNow() {
    await this.emailService.fetchUnreadEmails();
    return { message: '이메일 폴링 완료' };
  }

  @Post('parse')
  @ApiOperation({ summary: '이메일 텍스트 AI 파싱' })
  async parseEmail(@Body() body: { text: string }) {
    const result = await this.aiService.parseEmailToReservation(body.text);
    return result;
  }
}
