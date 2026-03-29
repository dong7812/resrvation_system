import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as XLSX from 'xlsx';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto, UpdateStatusDto, QueryReservationDto } from './dto/reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private repo: Repository<Reservation>,
  ) {}

  async findAll(query: QueryReservationDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) where.name = Like(`%${query.search}%`);
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const r = await this.repo.findOneBy({ id });
    if (!r) throw new NotFoundException(`예약 ID ${id}를 찾을 수 없습니다`);
    return r;
  }

  async create(dto: CreateReservationDto) {
    const reservation = this.repo.create(dto);
    return this.repo.save(reservation);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const reservation = await this.findOne(id);
    reservation.status = dto.status;
    return this.repo.save(reservation);
  }

  async remove(id: number) {
    const reservation = await this.findOne(id);
    return this.repo.remove(reservation);
  }

  async importFromExcel(buffer: Buffer): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException('Excel 파일을 읽을 수 없습니다');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) throw new BadRequestException('데이터가 없습니다');

    const COL_MAP: Record<string, keyof CreateReservationDto> = {
      '이름': 'name', 'name': 'name',
      '전화번호': 'phone', 'phone': 'phone',
      '이메일': 'email', 'email': 'email',
      '행사명': 'eventName', 'eventName': 'eventName',
      '장소': 'venue', 'venue': 'venue',
      '행사일': 'eventDate', 'eventDate': 'eventDate',
      '시식일': 'tastingDate', 'tastingDate': 'tastingDate',
      '인원': 'guestCount', 'guestCount': 'guestCount',
      '메모': 'note', 'note': 'note',
    };

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dto: Partial<CreateReservationDto> = {};

      for (const [colName, field] of Object.entries(COL_MAP)) {
        if (row[colName] !== undefined && row[colName] !== '') {
          (dto as Record<string, unknown>)[field] = field === 'guestCount'
            ? Number(row[colName]) || 0
            : String(row[colName]);
        }
      }

      if (!dto.name || !dto.phone || !dto.email || !dto.eventName || !dto.venue) {
        errors.push(`${i + 2}행: 필수값 누락 (이름, 전화번호, 이메일, 행사명, 장소)`);
        skipped++;
        continue;
      }

      const statusRaw = String(row['상태'] ?? row['status'] ?? '').trim();
      const statusMap: Record<string, string> = { '승인': 'approved', '거절': 'rejected', '대기': 'pending' };
      const status = statusMap[statusRaw] ?? (['approved', 'rejected', 'pending'].includes(statusRaw) ? statusRaw : 'pending');

      const reservation = this.repo.create({ ...dto, status } as Reservation);
      await this.repo.save(reservation);
      imported++;
    }

    return { imported, skipped, errors };
  }

  getExcelTemplate(): Buffer {
    const headers = [['이름', '전화번호', '이메일', '행사명', '장소', '행사일', '시식일', '인원', '메모', '상태']];
    const example = [['홍길동', '010-1234-5678', 'hong@example.com', '결혼 리셉션', '서울 그랜드호텔', '2024-06-15', '2024-05-20', 100, '알레르기 없음', '대기']];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    ws['!cols'] = headers[0].map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '예약목록');
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  async getStats() {
    const total = await this.repo.count();
    const pending = await this.repo.countBy({ status: 'pending' });
    const approved = await this.repo.countBy({ status: 'approved' });
    const rejected = await this.repo.countBy({ status: 'rejected' });
    const customers = await this.repo
      .createQueryBuilder('r')
      .select('COUNT(DISTINCT r.email)', 'count')
      .getRawOne();

    return {
      total,
      pending,
      approved,
      rejected,
      uniqueCustomers: parseInt(customers.count),
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }
}
