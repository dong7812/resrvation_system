import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { ReservationsService } from '../reservations/reservations.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private config: ConfigService,
    private aiService: AiService,
    private reservationsService: ReservationsService,
  ) {}

  async fetchUnreadEmails(): Promise<void> {
    this.logger.log('이메일 폴링 시작...');

    const imap = new Imap({
      user: this.config.get<string>('IMAP_USER'),
      password: this.config.get<string>('IMAP_PASSWORD'),
      host: this.config.get<string>('IMAP_HOST', 'imap.gmail.com'),
      port: this.config.get<number>('IMAP_PORT', 993),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    return new Promise((resolve, reject) => {
      imap.once('error', (err) => {
        this.logger.error('IMAP 연결 오류:', err);
        reject(err);
      });

      imap.once('ready', () => {
        imap.openBox('INBOX', false, async (err) => {
          if (err) { imap.end(); return reject(err); }

          imap.search(['UNSEEN'], async (err, uids) => {
            if (err || !uids.length) {
              this.logger.log(`읽지 않은 이메일 없음`);
              imap.end();
              return resolve();
            }

            this.logger.log(`새 이메일 ${uids.length}건 발견`);
            const fetch = imap.fetch(uids, { bodies: '', markSeen: true });
            const parsePromises: Promise<void>[] = [];

            fetch.on('message', (msg, seqno) => {
              parsePromises.push(
                new Promise((res) => {
                  msg.on('body', async (stream) => {
                    try {
                      const parsed = await simpleParser(stream as any);
                      const text = parsed.text ?? (parsed.html as string) ?? '';
                      const messageId = parsed.messageId ?? `uid-${seqno}`;

                      const data = await this.aiService.parseEmailToReservation(text);

                      if (data.isReservation) {
                        await this.reservationsService.create({
                          ...data,
                          rawEmailId: messageId,
                        });
                        this.logger.log(`예약 생성: ${data.name} - ${data.eventName}`);
                      }
                    } catch (e) {
                      this.logger.error('메시지 처리 오류:', e);
                    }
                    res();
                  });
                }),
              );
            });

            fetch.once('end', async () => {
              await Promise.all(parsePromises);
              imap.end();
              resolve();
            });
          });
        });
      });

      imap.connect();
    });
  }
}
