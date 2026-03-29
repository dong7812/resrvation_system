import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('fetch')
  @ApiOperation({ summary: '이메일 수동 폴링 트리거' })
  async fetchNow() {
    await this.emailService.fetchUnreadEmails();
    return { message: '이메일 폴링 완료' };
  }
}
