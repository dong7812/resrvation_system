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
    const command = new ConverseCommand({
      modelId: BEDROCK_MODEL_ID,
      system: [
        {
          text: `당신은 케이터링 예약 및 문의 이메일 파서입니다.
이메일 텍스트를 분석하여 예약/문의 정보를 추출하고 아래 JSON 형식으로만 반환하세요.
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

isReservation 판단 기준:
- 케이터링, 출장 뷔페, 행사 음식, 시식, 예약, 문의 등 케이터링 서비스와 관련된 내용이면 true
- 광고, 스팸, 케이터링과 무관한 내용이면 false

날짜는 YYYY-MM-DD 형식으로 변환하고, 없는 정보는 빈 문자열("") 또는 0으로 반환.`,
        },
      ],
      messages: [{ role: 'user', content: [{ text: emailText }] }],
      inferenceConfig: { maxTokens: 1024 },
    });

    const response = await this.client.send(command);
    const raw = response.output?.message?.content?.[0]?.text ?? '';
    this.logger.log('Bedrock 응답 원문:', raw);
    const cleaned = raw.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
