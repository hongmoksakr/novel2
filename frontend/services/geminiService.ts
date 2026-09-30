import { GoogleGenAI } from '@google/genai';
import { WorldbuildingState, EpisodeCard, VolumeLevel, SensualLevel, CommenterPersona } from '../types';

// Helper to instantiate client safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey, vertexai: true });
};

/**
 * Generate full chapter text based on outlines and intensity levers
 */
export async function generateChapterDraft(
  world: WorldbuildingState,
  episode: EpisodeCard,
  volume: VolumeLevel,
  sensual: SensualLevel
): Promise<string> {
  const ai = getAiClient();

  // Target word count based on volume
  const volumeGuide: Record<VolumeLevel, string> = {
    '100%': '공백 포함 약 2,000자 ~ 2,500자의 밀도 높은 웹소설 1화 분량.',
    '125%': '공백 포함 약 3,200자 ~ 3,800자의 디테일한 대사와 묘사가 확장된 분량.',
    '150%': '공백 포함 약 4,500자 ~ 5,500자의 심도 깊은 심리선과 상황이 포함된 상세 분량.',
    '175%': '공백 포함 약 6,500자 내외의 장대한 씬 연출과 사건 빌드업 분량.',
    '200%': '공백 포함 약 8,000자 이상의 극대화된 분량, 모든 제스처와 내면 갈등, 관능적 긴장을 극도로 풀어낸 분량.'
  };

  // Explicit sensual tone instruction
  const sensualGuide: Record<SensualLevel, string> = {
    '100%': '은밀한 시선, 긴장감 넘치는 침묵, 스치는 손길 위주의 심리적 성적 텐션 유지.',
    '125%': '노골적인 신체적 접촉, 호흡과 맥박의 묘사, 주종 관계와 은밀한 복종의 대사 강조.',
    '150%': '적나라하고 자극적인 신체적 묘사, 수치심과 쾌락의 교차, 엄격한 훈육과 길들이기 서술 가미.',
    '175%': '높은 수위의 관능 묘사, 배덕감 넘치는 장소(교회/성가대실)의 대조, 통제와 지배, 애원하는 대사.',
    '200%': '극도의 음탕함과 천박함, 날것 그대로의 원초적 갈망과 피학적 쾌락, 숨김없는 감각의 극치 묘사.'
  };

  const prompt = `
당신은 한국 웹소설계 최고의 고수위 로맨스/피폐/배덕물 전문 작가입니다.
아래의 [세계관 및 캐릭터 설정]과 [에피소드 정보], 그리고 [분량/수위 조절 옵션]을 바탕으로 몰입도 높은 본문을 집필해 주세요.

[소설 메타 설정]
- 제목: ${world.title}
- 주요 태그: ${world.tags.join(', ')}
- 남주: ${world.maleLead.name} (${world.maleLead.age}, ${world.maleLead.role})
  * 성격/성향: ${world.maleLead.personality}
  * 외모: ${world.maleLead.appearance}
  * 특성: ${world.maleLead.hiddenTrait}
- 여주: ${world.femaleLead.name} (${world.femaleLead.age}, ${world.femaleLead.role})
  * 성격/성향: ${world.femaleLead.personality}
  * 외모: ${world.femaleLead.appearance}
  * 결핍/욕망: ${world.femaleLead.secretDesire}
- 주변 인물: ${world.supportingCast}
- 문체 및 톤: ${world.toneStyle}
- 시점: ${world.pov} / 시제: ${world.tense}

[대상 에피소드]
- 회차: ${episode.title} (Hero's Journey Stage ${episode.stageNumber})
- 줄거리: ${episode.outline}
- 핵심 갈등: ${episode.keyConflict}
- 클라이맥스 포인트: ${episode.climaxPoint}

[집필 조절 파라미터]
- 분량 목표 (${volume}): ${volumeGuide[volume]}
- 수위 및 서술 강도 (${sensual}): ${sensualGuide[sensual]}

[집필 규칙]
1. 불필요한 메타 설명(예: "네, 작성하겠습니다") 없이 바로 본문 소설 텍스트만 출력하세요.
2. 대사와 지문 간의 템포를 웹소설 특유의 흡입력 있는 호흡으로 줄바꿈하여 작성하세요.
3. 지정된 수위(${sensual})와 캐릭터 성격(지배적 연하 전도사 & 피학적 연상 성가대 리더)의 배덕감을 최고조로 표현하세요.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '본문 생성 결과를 받아오지 못했습니다.';
  } catch (err: any) {
    console.error('Draft generation error:', err);
    return `[생성 오류 발생: ${err.message || '네트워크 상태나 API 설정을 확인해주세요.'}]\n\n임시 백업 본문: ${episode.title}\n\n어두운 예배당 안에 빗소리가 낮게 울려 퍼졌다. ${world.maleLead.name}의 단정한 발걸음 소리가 성가대석 뒤편의 마룻바닥을 울리며 다가왔다...`;
  }
}

/**
 * Step 4 Selection Rewrite
 */
export async function rewriteSelection(
  fullContext: string,
  selectedText: string,
  instruction: string,
  world: WorldbuildingState
): Promise<string> {
  const ai = getAiClient();

  const prompt = `
당신은 웹소설 전문 편집 AI입니다.
아래는 현재 집필 중인 소설 본문에서 사용자가 수정을 요청한 [선택된 문장 구역]입니다.

[전체 맥락 일부]:
"...${fullContext.slice(Math.max(0, fullContext.indexOf(selectedText) - 200), fullContext.indexOf(selectedText) + selectedText.length + 200)}..."

[수정 대상 문장]:
"${selectedText}"

[수정 요청 지시]:
"${instruction}"

[작품 분위기]:
- 장르: ${world.tags.join(', ')}
- 문체: ${world.toneStyle}

지침:
1. 오직 수정된 새로운 문장(대체될 텍스트)만 정확히 출력하십시오.
2. 따옴표나 서두 해설 없이 교체할 글자들만 그대로 반환하세요.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || selectedText;
  } catch (err) {
    console.error('Selection rewrite error:', err);
    return selectedText;
  }
}

/**
 * Step 5 Binge-reading continuous comments generation
 */
export async function generateBingeComments(
  episode: EpisodeCard,
  draftSnippet: string,
  personas: CommenterPersona[],
  previousCommentsSummary: string
): Promise<Array<{ personaId: string; content: string; upvotes: number; downvotes: number; rating?: number; isBest?: boolean }>> {
  const ai = getAiClient();

  const personasInfo = personas.map(p => `[ID: ${p.id}] 플랫폼: ${p.platform} / 닉네임: ${p.name} / 성향: ${p.personality} / 말투: ${p.commentTone}`).join('\n');

  const prompt = `
웹소설 플랫폼 독자 반응 시뮬레이터입니다.
이번 에피소드를 감상한 각 페르소나별 '리얼한 연쇄 댓글'을 생성하세요.

[현재 에피소드]:
제목: ${episode.title}
내용 요약: ${episode.outline}
본문 발췌: "${draftSnippet.slice(0, 500)}..."

[이전 회차까지의 독자 반응 요약/맥락]:
${previousCommentsSummary || '첫 화이거나 초반부 반응입니다. 복선과 긴장감에 주목 중.'}

[참여 페르소나 독자단]:
${personasInfo}

요구사항:
- 각 독자는 자신의 플랫폼(Theqoo, ArcaLive, Novelpia, RidiBooks)의 실제 인터넷 말투와 밈을 살려야 합니다.
- 이전 회차의 떡밥이나 복선을 기억하고 언급하는 '연속 정주행(Binge-Reading)' 느낌을 주어야 합니다.
- JSON 배열 형식으로만 반환하세요:
[
  {
    "personaId": "p-1",
    "content": "댓글 본문",
    "upvotes": 42,
    "downvotes": 2,
    "rating": 5,
    "isBest": true
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    return parsed;
  } catch (err) {
    console.error('Comment generation error:', err);
    // Fallback comments
    return personas.map((p, idx) => ({
      personaId: p.id,
      content: `${episode.title} 보는데 ${p.name} 취향 제대로 저격함... 다음 화 언제 올라오나요?`,
      upvotes: (idx + 1) * 15,
      downvotes: 1,
      rating: 5,
      isBest: idx === 0
    }));
  }
}

/**
 * AI Co-pilot Chatbot with dynamic action execution
 */
export async function askAiCopilot(
  userQuery: string,
  currentState: {
    world: WorldbuildingState;
    episodes: EpisodeCard[];
    currentStep: number;
  }
): Promise<{ replyText: string; action?: { type: string; payload: any } }> {
  const ai = getAiClient();

  const systemInstruction = `
당신은 K-웹소설 창작 스튜디오의 메인 AI 어시스턴트(Co-pilot)입니다.
사용자는 좌측 채팅창을 통해 질문하거나, 1~6단계 우측 대시보드의 상태 수정을 명령합니다.

[현재 소설 정보]
- 제목: ${currentState.world.title}
- 남주: ${currentState.world.maleLead.name} (${currentState.world.maleLead.role})
- 여주: ${currentState.femaleLead.name} (${currentState.femaleLead.role})
- 등록된 에피소드 수: ${currentState.episodes.length}개
- 활성화된 탭: Step ${currentState.currentStep}

[상태 조작 액션 지원]
사용자가 1단계 설정 변경(예: "여주 설정 바꿔줘", "제목 변경해줘") 또는 2단계 에피소드 추가(예: "2단계에 4화 추가해줘")를 요청하면,
친절한 대답과 함께 반드시 JSON 구조의 액션 블록을 응답 마지막에 포함하세요.

지원 액션 타입:
1. UPDATE_WORLDBUILDING: { field: "title" | "maleLead" | "femaleLead" | "toneStyle" | "tags", value: any }
2. ADD_EPISODE: { stageNumber: number, title: string, outline: string, keyConflict: string, climaxPoint: string }
3. NO_ACTION

출력 양식:
일반 친절한 답변 텍스트...

\`\`\`json
{
  "actionType": "UPDATE_WORLDBUILDING" 또는 "ADD_EPISODE" 또는 "NONE",
  "payload": { ... }
}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction,
      }
    });

    const fullText = response.text || '';
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);

    let action: any = undefined;
    let cleanReply = fullText;

    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.actionType && parsed.actionType !== 'NONE') {
          action = {
            type: parsed.actionType,
            payload: parsed.payload
          };
        }
        cleanReply = fullText.replace(/```json[\s\S]*?```/, '').trim();
      } catch (e) {
        console.warn('JSON parsing error in action block', e);
      }
    }

    return {
      replyText: cleanReply,
      action
    };
  } catch (err: any) {
    console.error('Chat error:', err);
    return {
      replyText: `죄송합니다. 처리 중 오류가 발생했습니다: ${err.message || 'API 오류'}. 수동으로 대시보드 탭에서 직접 수정하실 수 있습니다.`
    };
  }
}
