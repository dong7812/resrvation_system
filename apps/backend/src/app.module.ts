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
        const dbHost = config.get('DB_HOST', 'localhost');
        const isRds = dbHost !== 'localhost' && dbHost !== '127.0.0.1';
        const dbSync = config.get('DB_SYNC') === 'true';
        return {
          type: 'postgres',
          host: dbHost,
          port: config.get<number>('DB_PORT', 5432),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'password'),
          database: config.get('DB_DATABASE', 'reservation_db'),
          entities: [Reservation, Admin],
          synchronize: dbSync,
          ssl: isRds ? { rejectUnauthorized: false } : false,
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
