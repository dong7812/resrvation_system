import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from './email.service';

@Injectable()
export class EmailScheduler {
  private readonly logger = new Logger(EmailScheduler.name);

  constructor(private emailService: EmailService) {}

  // 5분마다 새 이메일 체크
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('이메일 스케줄러 실행');
    try {
      await this.emailService.fetchUnreadEmails();
    } catch (error) {
      this.logger.error('스케줄러 오류:', error);
    }
  }
}
