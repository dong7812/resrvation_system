import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type ReservationStatus = 'pending' | 'approved' | 'rejected';

@Entity('reservations')
export class Reservation {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column() name: string;
  @ApiProperty() @Column() phone: string;
  @ApiProperty() @Column() email: string;
  @ApiProperty() @Column() eventName: string;
  @ApiProperty() @Column() venue: string;
  @ApiProperty() @Column({ nullable: true }) eventDate: string;
  @ApiProperty() @Column({ nullable: true }) tastingDate: string;
  @ApiProperty() @Column({ default: 0 }) guestCount: number;
  @ApiProperty() @Column({ nullable: true, type: 'text' }) note: string;
  @ApiProperty() @Column({ default: 'pending' }) status: ReservationStatus;
  @ApiProperty() @Column({ nullable: true }) rawEmailId: string;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
