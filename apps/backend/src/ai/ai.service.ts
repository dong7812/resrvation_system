import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ParsedReservation {
  isReservation: boolean;
  name: string;
  phone: string;
  email: string;
  eventName: string;
  venue: string;
  eventDate: string;
  tastingDate: string;
  guestCount: number;
  note: string;
}

// Bedrock에서 사용 가능한 Claude 모델 ID
// 콘솔 > Bedrock > Model access 에서 활성화 필요
const BEDROCK_MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: BedrockRuntimeClient;

  constructor(private config: ConfigService) {
    // ECS Task Role이 IAM 권한을 자동 제공 (액세스 키 불필요)
    this.client = new BedrockRuntimeClient({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
    });
  }

  async parseEmailToReservation(emailText: string): Promise<ParsedReservation> {
    try {
      const command = new ConverseCommand({
        modelId: BEDROCK_MODEL_ID,
        system: [
          {
            text: `당신은 케이터링 예약 이메일 파서입니다.
이메일 텍스트를 분석하여 예약 정보를 추출하고 아래 JSON 형식으로만 반환하세요.
설명, 마크다운 코드블록 없이 순수 JSON만 반환하세요.

{
  "isReservation": true/false,
  "name": "예약자 성명",
  "phone": "연락처",
  "email": "이메일",
  "eventName": "행사명",
  "venue": "행사장소",
  "eventDate": "YYYY-MM-DD",
  "tastingDate": "YYYY-MM-DD",
  "guestCount": 숫자,
  "note": "문의사항"
}

예약 관련 이메일이 아니면 isReservation: false, 나머지는 빈 값으로 반환.`,
          },
        ],
        messages: [{ role: 'user', content: [{ text: emailText }] }],
        inferenceConfig: { maxTokens: 1024 },
      });

      const response = await this.client.send(command);
      const raw = response.output?.message?.content?.[0]?.text ?? '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error('이메일 파싱 실패:', error);
      return {
        isReservation: false,
        name: '', phone: '', email: '', eventName: '',
        venue: '', eventDate: '', tastingDate: '', guestCount: 0, note: '',
      };
    }
  }
}
