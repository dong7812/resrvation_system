import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailScheduler } from './email.scheduler';
import { EmailController } from './email.controller';
import { AiModule } from '../ai/ai.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [AiModule, ReservationsModule],
  controllers: [EmailController],
  providers: [EmailService, EmailScheduler],
  exports: [EmailService],
})
export class EmailModule {}
