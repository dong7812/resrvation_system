import { IsString, IsEmail, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() eventName: string;
  @ApiProperty() @IsString() venue: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eventDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tastingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() guestCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rawEmailId?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ['pending', 'approved', 'rejected'] })
  @IsIn(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}

export class QueryReservationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
