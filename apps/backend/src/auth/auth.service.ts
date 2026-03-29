import { Injectable, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // 앱 시작 시 초기 관리자 계정 자동 생성
  async onModuleInit() {
    const email = this.config.get('ADMIN_EMAIL', 'admin@example.com');
    const existing = await this.adminRepo.findOneBy({ email });
    if (!existing) {
      const password = this.config.get('ADMIN_PASSWORD', 'admin1234');
      const hashed = await bcrypt.hash(password, 10);
      await this.adminRepo.save({ email, password: hashed });
      this.logger.log(`초기 관리자 계정 생성: ${email}`);
    }
  }

  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOneBy({ email: dto.email });
    if (!admin) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  }
}
