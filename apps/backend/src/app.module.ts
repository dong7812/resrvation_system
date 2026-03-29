import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationsModule } from './reservations/reservations.module';
import { EmailModule } from './email/email.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { Reservation } from './reservations/entities/reservation.entity';
import { Admin } from './auth/entities/admin.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'password'),
          database: config.get('DB_DATABASE', 'reservation_db'),
          entities: [Reservation, Admin],
          synchronize: !isProd, // RDS 프로덕션에서는 반드시 false
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    ReservationsModule,
    EmailModule,
    AiModule,
    AuthModule,
  ],
})
export class AppModule {}
