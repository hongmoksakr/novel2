import { GoogleGenAI } from '@google/genai';
import { NovelSettings, Episode, CommenterPersona, EpisodeComment, ActionProposal, ActionType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export type MultiplierLevel = 100 | 125 | 150 | 175 | 200;

export interface AssistantResponse {
  messageText: string;
  proposal?: ActionProposal;
}

export async function askNovelAssistant(
  prompt: string,
  context: {
    currentStep: number;
    settings: NovelSettings;
    episodes: Episode[];
    personas: CommenterPersona[];
    activeEpisodeId?: string;
  }
): Promise<AssistantResponse> {
  const activeEp = context.episodes.find(e => e.id === context.activeEpisodeId) || context.episodes[0];

  const systemInstruction = `당신은 대한민국 최고 수준의 웹소설 디렉터 AI '스토리포지 에디터'입니다.
현재 작품의 핵심 장르는 [사제지간, 연상녀연하남, 개신교회 연애, 메조히스트 여성, 조교물(심리적 통제 및 복종)]입니다.
현재 작가는 우측 화면의 [${context.currentStep}단계]를 집중 작업 중입니다.

[1단계 기획 철저 준수 원칙]
- 소설 제목: ${context.settings.title}
- 세부 장르: ${context.settings.genre}
- 키워드 태그: ${context.settings.tags.join(', ')}
- 남주인공 설정: ${context.settings.maleLead}
- 여주인공 설정: ${context.settings.femaleLead}
- 주요 조연: ${context.settings.supportingChars}
- 문체 가이드: ${context.settings.writingStyle}
- 사건 시점: ${context.settings.storyPov}
- 작성 시점(시제): ${context.settings.narrativeTense}
- 타깃 독자층: ${context.settings.targetAudience}
- 핵심 시놉시스: ${context.settings.synopsis}
- 현재 에피소드: ${activeEp ? `${activeEp.title} (${activeEp.stageTitle})` : '없음'}

모든 제안과 수정은 위 1단계 기획 설정의 인물 관계(연상 전도사 스승 vs 연하 청년 제자 지배자), 개신교회 배경의 성스러움과 은밀한 배덕감의 대비를 엄격히 준수해야 합니다.

[핵심 요구사항 - 구체적 단계 데이터 반영]
작가가 설정 변경, 아이디어 추가, 대사 제안, 플롯 구상, 본문 작성 요청 등을 명령하면, 친절하고 날카로운 해설 텍스트와 함께 **현재 단계(${context.currentStep}단계)에 즉시 반영할 수 있는 구체적인 JSON 블록을 응답 끝에 반드시 포함**하세요.

JSON 블록 형식 (반드시 \`\`\`json:action 코드블록으로 감싸주세요):
만약 1단계라면:
\`\`\`json:action
{
  "targetStep": 1,
  "type": "update_settings",
  "label": "1단계 설정에 반영하기",
  "summary": "제목 및 남녀 주인공 설정 업데이트",
  "payload": {
    "title": "변경된 제목(필요시)",
    "tags": ["태그1", "태그2"],
    "maleLead": "구체적으로 보강된 남주인공 내용",
    "femaleLead": "구체적으로 보강된 여주인공 내용",
    "synopsis": "수정/보강된 시놉시스",
    "writingStyle": "문체 스타일 수정(필요시)"
  }
}
\`\`\`

만약 2단계라면:
\`\`\`json:action
{
  "targetStep": 2,
  "type": "add_episode",
  "label": "2단계에 새 에피소드 플롯 추가",
  "summary": "제N화 에피소드 얼개 추가",
  "payload": {
    "stageId": 1,
    "stageTitle": "5. 첫 관문 통과 (Crossing the First Threshold)",
    "title": "제N화. 에피소드 제목",
    "summary": "구체적인 사건 요약",
    "keyEvents": ["사건 1", "사건 2", "사건 3"],
    "conflict": "중심 갈등 및 배덕감 요소"
  }
}
\`\`\`

만약 3단계라면:
\`\`\`json:action
{
  "targetStep": 3,
  "type": "replace_content",
  "label": "3단계 본문으로 대체하기",
  "summary": "현재 에피소드 본문 작성안",
  "payload": {
    "content": "작성된 소설 본문 내용..."
  }
}
\`\`\`

만약 5단계라면:
\`\`\`json:action
{
  "targetStep": 5,
  "type": "add_persona",
  "label": "5단계 독자 페르소나로 추가",
  "summary": "새로운 커뮤니티 독자 등록",
  "payload": {
    "name": "닉네임",
    "platform": "더쿠 | 리디북스 | 노벨피아 | 아카라이브 | 조아라",
    "age": "20대 여성",
    "gender": "여성",
    "personality": "성격 요약",
    "toneStyle": "말투 특징",
    "favoriteGenre": "배덕 로맨스",
    "avatarColor": "bg-indigo-600"
  }
}
\`\`\`

설명과 소설적 조언은 마크다운으로 먼저 작성하고, 실제 반영할 데이터는 맨 아래 \`\`\`json:action 코드블록 안에 명시하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85,
      }
    });

    const fullText = response.text || '';
    let messageText = fullText;
    let proposal: ActionProposal | undefined = undefined;

    // Parse ```json:action ... ``` block
    const actionRegex = /```json:action\s*([\s\S]*?)\s*```/;
    const match = fullText.match(actionRegex);

    if (match && match[1]) {
      try {
        const rawJson = JSON.parse(match[1]);
        proposal = {
          id: `prop-${Date.now()}`,
          targetStep: rawJson.targetStep || context.currentStep,
          type: rawJson.type as ActionType,
          label: rawJson.label || `${context.currentStep}단계에 즉시 반영`,
          summary: rawJson.summary || 'AI가 제안한 디테일 내용',
          payload: rawJson.payload,
          applied: false
        };
        messageText = fullText.replace(actionRegex, '').trim();
      } catch (parseErr) {
        console.warn('Action proposal JSON parse failed:', parseErr);
      }
    }

    return {
      messageText,
      proposal
    };
  } catch (error) {
    console.error('Gemini Assistant Error:', error);
    return {
      messageText: 'AI 조력자와 연결하는 중 일시적 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    };
  }
}

export async function generateNovelSettingsAI(themeHint: string): Promise<Partial<NovelSettings>> {
  const prompt = `주제/키워드: "${themeHint || '사제지간, 연상연하, 개신교회 연애, 메조히스트 여성, 심리 조교물'}"
위 장르적 특성을 완벽히 반영한 웹소설 1단계 기획 설정을 생성해주세요.
반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "소설 제목 (금기와 배덕감이 느껴지는 감각적인 제목)",
  "genre": "사제지간 / 연상연하 / 개신교회 연애 / 메조히스트 여성 / 심리 조교물",
  "tags": ["사제지간", "연상연하", "교회물", "메조히스트", "심리조교", "금기", "배덕감"],
  "maleLead": "남주인공 (성가대 지휘/청년 연하남, 차분한 통제광, 냉정한 조교자)",
  "femaleLead": "여주인공 (유년부 전도사/스승 연상녀, 경건한 가면 뒤 메조히스틱 순종 욕망)",
  "supportingChars": "담임목사, 청년부 회장 등 의심과 긴장감을 유발하는 인물 2-3명",
  "writingStyle": "밀도 높은 호흡, 종교적 은유와 감각적 굴복의 대비를 살린 농밀한 문체",
  "storyPov": "여주인공 1인칭 시점 위주",
  "narrativeTense": "현재형 혼용 과거형 서술",
  "targetAudience": "20~40대 성인 웹소설 독자, 배덕감 넘치는 심리 로맨스 마니아",
  "synopsis": "흡입력 있는 3~4줄 시놉시스"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.85,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (err) {
    console.error('generateNovelSettingsAI error:', err);
    throw err;
  }
}

export async function generateStageEpisodesAI(
  stageId: number,
  stageName: string,
  stageDesc: string,
  settings: NovelSettings,
  existingCount: number,
  generateCount: number = 2
): Promise<Array<{ title: string; summary: string; keyEvents: string[]; conflict: string }>> {
  const prompt = `소설 기본 설정 (1단계 기획 사항):
- 제목: ${settings.title}
- 장르: ${settings.genre}
- 남주인공: ${settings.maleLead}
- 여주인공: ${settings.femaleLead}
- 시놉시스: ${settings.synopsis}

[영웅의 여정 12단계 중 ${stageId}단계: ${stageName}]
단계 설명: ${stageDesc}

이 단계에 배치할 세부 에피소드를 ${generateCount}개 기획해주세요. (에피소드 번호는 기존에 ${existingCount}개가 이미 작성됨을 감안)
반드시 아래 JSON 배열 형식으로만 응답하세요:
[
  {
    "title": "제 N화. 에피소드 제목",
    "summary": "에피소드의 핵심 줄거리 2~3줄 요약",
    "keyEvents": ["핵심 사건 1", "핵심 사건 2", "핵심 사건 3"],
    "conflict": "교회라는 성역 안에서의 위기와 심리적 굴복 갈등"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (err) {
    console.error('generateStageEpisodesAI error:', err);
    throw err;
  }
}

export async function draftEpisodeContentAI(
  episode: Episode,
  settings: NovelSettings,
  lengthMultiplier: MultiplierLevel,
  intensityLevel: MultiplierLevel,
  prevEpisodeSnippet?: string
): Promise<string> {
  const targetWordsMap: Record<MultiplierLevel, string> = {
    100: '공백 포함 약 2,000자 내외 (기본 100%)',
    125: '공백 포함 약 2,600자 내외 (풍성한 125%)',
    150: '공백 포함 약 3,500자 내외 (대용량 150%)',
    175: '공백 포함 약 4,500자 내외 (초고용량 175%)',
    200: '공백 포함 약 5,500자 이상의 압도적 연재 분량 (극대용량 200%)'
  };

  const intensityGuideMap: Record<MultiplierLevel, string> = {
    100: `[수위 100% - 절제된 긴장감과 심리적 배덕감]
- 은밀한 시선 교환, 낮게 읊조리는 차가운 명령, 스승과 제자의 위계가 뒤집히는 첫 규율과 심리적 압박에 집중.
- 육체적 접촉은 가벼운 체벌(뺨, 억압적인 손길)과 무릎 꿇림 위주로 진행.`,
    125: `[수위 125% - 노골적인 수치심과 거친 훈육]
- 성가대실/기도실이라는 신성한 공간에서 발생하는 언어적 굴종 유도.
- "전도사님, 주제를 아셔야죠", "벌을 서는 자태가 제법 볼만하네요" 등 인물의 수치심을 자극하는 차갑고 직설적인 대사와 육체적 통제 강화.`,
    150: `[수위 150% - 음탕하고 노골적인 복종 서술]
- 연하 제자의 강압적이고 천박한 훈육 대사와 이에 메조히스틱하게 전율하며 굴복하는 연상녀의 본능적 반응을 여과 없이 묘사.
- 단정한 전도사 복장 밑으로 무너져 내리는 수치심, 숨소리와 땀방울, 피부의 떨림을 감각적이고 적나라하게 서술.`,
    175: `[수위 175% - 성역 속 극단적 배덕감과 원색적 육체 묘사]
- 하나님의 성전 바로 아래서 행해지는 잔혹하고 천박한 조교의 현장감 극대화.
- 거룩한 찬송과 대비되는 음란하고 원색적인 언어 구사, 수치스러운 체벌과 애원을 유도하는 연하남의 지배력을 가감 없이 거칠게 폭발시킴.`,
    200: `[수위 200% - 위선을 완전히 찢어발기는 극도의 음탕함과 파멸적 타락]
- 모든 종교적 도덕과 체면을 박살 내고, 기꺼이 천박한 노예로 길들여지는 연상 여주인공의 극단적 쾌락과 메조히즘을 적나라하고 음란하게 폭주시키는 최고 수위.
- 연하남의 냉혹하고 천박한 매도, 거침없는 언어적 유린과 온몸을 내맡기는 여주의 완전한 타락과 종속을 생생하고 파격적으로 집필.`
  };

  const prompt = `당신은 최고 수준의 고수위 심리 로맨스 웹소설 작가입니다. 
[1단계 기획 설정 명세서]를 100% 철저히 준수하여 아래 에피소드 원고를 집필하세요.

=======================================================
[1단계 기획 설정 명세서 (절대 준수 규정)]
- 작품 제목: ${settings.title}
- 핵심 장르: ${settings.genre} (사제지간, 연상녀연하남, 개신교회 연애, 메조히스트 여성, 조교물)
- 작품 키워드 태그: ${settings.tags.join(', ')}
- 남주인공 상세 설정: ${settings.maleLead}
- 여주인공 상세 설정: ${settings.femaleLead}
- 주요 조연 및 갈등 유발자: ${settings.supportingChars}
- 지정 문체 스타일: ${settings.writingStyle}
- 사건 시점(POV): ${settings.storyPov}
- 작성 시점(시제): ${settings.narrativeTense}
- 타깃 독자층 요구: ${settings.targetAudience}
- 핵심 시놉시스 및 복선: ${settings.synopsis}
=======================================================

[집필 대상 에피소드]
- 에피소드 화차 및 제목: ${episode.title}
- 영웅의 여정 단계: ${episode.stageTitle}
- 에피소드 줄거리 요약: ${episode.summary}
- 에피소드 핵심 사건 흐름: ${episode.keyEvents.join(' -> ')}
- 중심 갈등 및 배덕감 포인트: ${episode.conflict}
${prevEpisodeSnippet ? `[직전 화의 마지막 전개 힌트]\n${prevEpisodeSnippet}` : ''}

[목표 분량 설정 (${lengthMultiplier}%)]
- ${targetWordsMap[lengthMultiplier]}
- 지정된 분량을 채우기 위해 인물의 미세한 숨소리, 떨림, 1단계에 명시된 여주인공의 메조히스틱 심리적 독백과 남주인공의 차가운 통제 대사 티키타카를 밀도 높게 전개하세요.

[묘사 수위 설정 (${intensityLevel}%)]
${intensityGuideMap[intensityLevel]}

[집필 준수 필수 가이드]
1. 1단계의 [사건 시점: ${settings.storyPov}]과 [작성 시점: ${settings.narrativeTense}]을 단 한 문장도 어기지 마세요.
2. 1단계의 [남주인공: ${settings.maleLead}]과 [여주인공: ${settings.femaleLead}]의 나이 차(연상녀 전도사 스승 vs 연하남 청년 제자), 성격, 말투를 완벽히 유지하세요.
3. 1단계의 [문체 가이드: ${settings.writingStyle}]에 맞춰 종교적 거룩함과 배덕적 굴복의 대비를 감각적으로 서술하세요.
4. 마크다운 해설, 안내문, 인사말 없이 오직 완성된 소설 본문 텍스트만 출력하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.88,
      }
    });

    return response.text.trim();
  } catch (err) {
    console.error('draftEpisodeContentAI error:', err);
    throw err;
  }
}

export async function refineTextSelectionAI(
  selectedText: string,
  instruction: string,
  settings: NovelSettings,
  episodeContext?: { title: string; stageTitle: string }
): Promise<string> {
  const prompt = `당신은 웹소설 전문 최고급 문장 윤문 및 퇴고 에디터입니다.
작가가 본문에서 직접 드래그하여 선택한 [선택된 원문 텍스트]를, [1단계 기획 설정 명세서]와 [작가의 수정 요청 사항]을 100% 준수하여 완벽하게 리라이팅/퇴고하세요.

=======================================================
[1단계 기획 설정 명세서 (퇴고 시 엄격 준수)]
- 작품 제목: ${settings.title}
- 장르: ${settings.genre} (사제지간 / 연상연하 / 개신교회 연애 / 메조히스트 여성 / 조교물)
- 문체 스타일: ${settings.writingStyle}
- 사건 시점: ${settings.storyPov}
- 시제(작성 시점): ${settings.narrativeTense}
- 남주인공 캐릭터: ${settings.maleLead}
- 여주인공 캐릭터: ${settings.femaleLead}
- 조연 및 긴장감: ${settings.supportingChars}
=======================================================
${episodeContext ? `[현재 에피소드 맥락]\n${episodeContext.title} (${episodeContext.stageTitle})\n` : ''}

[선택된 원문 텍스트 (수정 대상)]
"""
${selectedText}
"""

[작가의 수정 요청 사항]
"""
${instruction}
"""

[퇴고 필수 규칙]
1. **반드시 선택된 원문 텍스트를 기초로 수정**해야 하며, 원문의 핵심 상황 맥락과 호흡을 자연스럽게 계승하면서 문장력, 대사 텐션, 감각 묘사를 극대화하세요.
2. 1단계 기획에 명시된 시점(${settings.storyPov}), 시제(${settings.narrativeTense}), 문체(${settings.writingStyle}), 인물의 호칭(선생님/전도사님/형제 등)과 사제지간 위계 관계를 엄격히 지키세요.
3. 선택된 원문 자리에 그대로 교체 삽입될 것이므로, 전후 문맥과 어색함이 없도록 자연스러운 이음새를 형성하세요.
4. 부가 설명, 인사말, 마크다운 주석 없이 오직 교체될 수정 텍스트만 깔끔하게 출력하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.75,
      }
    });

    return response.text.trim();
  } catch (err) {
    console.error('refineTextSelectionAI error:', err);
    throw err;
  }
}

export async function generatePersonasAI(count: number = 5): Promise<CommenterPersona[]> {
  const prompt = `사제지간, 연상연하, 개신교회 연애, 메조히스트 여성, 조교물 장르에 과몰입하여 열광하는 다양한 독자 페르소나를 ${count}명 생성해주세요.
플랫폼 스타일은 반드시 ['더쿠', '아카라이브', '노벨피아', '리디북스', '디시인사이드', '조아라'] 중에서 골고루 배정하세요.

반드시 아래 JSON 형식으로 응답하세요:
[
  {
    "id": "p-아이디",
    "name": "닉네임",
    "platform": "더쿠 | 아카라이브 | 노벨피아 | 리디북스 | 디시인사이드 | 조아라",
    "age": "20대 초반 등",
    "gender": "남성 | 여성",
    "personality": "성격 및 독서 성향",
    "toneStyle": "말투 특징 및 자주 쓰는 표현",
    "favoriteGenre": "선호 장르",
    "avatarColor": "bg-indigo-500 | bg-pink-500 | bg-emerald-500 | bg-amber-500 | bg-purple-500 | bg-blue-600"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.85,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (err) {
    console.error('generatePersonasAI error:', err);
    throw err;
  }
}

export async function generateBingeCommentsAI(
  episodes: Episode[],
  personas: CommenterPersona[]
): Promise<EpisodeComment[]> {
  const episodeSummaries = episodes.map((ep, idx) => `[${idx + 1}회: ${ep.title}]\n줄거리: ${ep.summary}\n본문 요약: ${ep.content.slice(0, 300)}...`).join('\n\n');
  const personaList = personas.map((p) => `- ID: ${p.id} / 닉네임: ${p.name} / 플랫폼: ${p.platform} / 연령성별: ${p.age} ${p.gender} / 성향: ${p.personality} / 말투: ${p.toneStyle}`).join('\n');

  const prompt = `웹소설 [사제지간 연상연하 개신교회 심리조교물] 연재작을 독자 페르소나들이 1회부터 정주행하면서 남긴 실감 나는 댓글을 생성해주세요.

[에피소드 목록]
${episodeSummaries}

[참여 독자 페르소나 목록]
${personaList}

[핵심 조건]
1. 독자들은 1회부터 마지막 회차까지 순서대로 정주행하고 있으므로, 1회에서 남긴 반응이 다음 회차에서 기억되거나 이어지는 '연속성(서사적 누적)'이 드러나야 합니다.
   예: "1화에서 기도실 가더니 2화에서 바로 뺨 때리고 무릎 꿇리는 거 실화냐", "지난화에 담임목사 발소리 들릴 때 식은땀 남" 등.
2. 각 플랫폼(더쿠: 과몰입 앓는 커뮤체, 아카라이브: 음슴체, 노벨피아: 캬/콘 밈, 리디북스: 장문 문해력 분석)의 억양과 문화를 100% 반영하세요.

반드시 아래 JSON 형식으로 응답하세요:
[
  {
    "id": "c-고유번호",
    "episodeId": "에피소드 ID (예: ep-1)",
    "personaId": "작성한 페르소나 ID",
    "personaName": "페르소나 닉네임",
    "platform": "플랫폼 이름",
    "content": "댓글 본문 (플랫폼 특유의 톤앤매너 완벽 반영)",
    "likes": 12,
    "dislikes": 1,
    "createdAt": "10분 전 | 1시간 전 | 방금 전",
    "reactionTag": "주접 | 분석 | 배덕감 | 과몰입 | 텐션폭발"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (err) {
    console.error('generateBingeCommentsAI error:', err);
    throw err;
  }
}
