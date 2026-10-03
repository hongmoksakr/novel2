import { GoogleGenAI } from '@google/genai';
import {
  WorldbuildingState,
  EpisodeCard,
  VolumeLevel,
  SensualLevel,
  CommenterPersona,
  Step1Section,
  Step1SectionUpdate,
  SupportingCharacter,
  ModelConfig,
  PlatformType,
  ChatProposedAction,
  ArchetypeRole,
  EpisodeComment
} from '../types';

// 순수 브라우저 클라이언트 인스턴스 취득
const getAiClient = () => {
  const key = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey: key, vertexai: true });
};

export function extractStep1TargetSections(text: string): Step1Section[] {
  const sections: Step1Section[] = [];
  const normalized = text.replace(/\s+/g, '');

  if (normalized.includes('[남성주인공]') || normalized.includes('[남주]') || normalized.includes('[남자주인공]')) {
    sections.push('MALE_LEAD');
  }
  if (normalized.includes('[여성주인공]') || normalized.includes('[여주]') || normalized.includes('[여자주인공]')) {
    sections.push('FEMALE_LEAD');
  }
  if (
    normalized.includes('[보조인물]') ||
    normalized.includes('[조연]') ||
    normalized.includes('[주변인물]') ||
    normalized.includes('보조인물') ||
    normalized.includes('조연')
  ) {
    sections.push('SUPPORTING_CAST');
  }
  if (
    normalized.includes('[스타일]') ||
    normalized.includes('[문체]') ||
    normalized.includes('[시점]') ||
    normalized.includes('[시제]') ||
    normalized.includes('[연도]') ||
    normalized.includes('[무대]') ||
    normalized.includes('[배경]') ||
    normalized.includes('스타일') ||
    normalized.includes('주요무대')
  ) {
    sections.push('STYLE_AND_TIME');
  }
  if (
    normalized.includes('[소설제목&태그&주요타겟독자층]') ||
    normalized.includes('[소설제목&태그]') ||
    normalized.includes('[소설제목]') ||
    normalized.includes('[태그]')
  ) {
    sections.push('META_BASIC');
  }

  return sections;
}

function createSectionChangeSummaries(updates: Step1SectionUpdate[]): string[] {
  const summaries: string[] = [];
  for (const u of updates) {
    if (u.section === 'MALE_LEAD') {
      const d = u.data;
      if (d.name) summaries.push(`이름: ${d.name}`);
      if (d.age || d.role) summaries.push(`신분: ${d.age || ''} ${d.role || ''}`.trim());
      if (d.speechStyle) summaries.push(`말투: "${d.speechStyle.slice(0, 35)}..."`);
      if (d.appearance) summaries.push(`외모: "${d.appearance.slice(0, 35)}..."`);
      if (d.personality) summaries.push(`성격: "${d.personality.slice(0, 35)}..."`);
    } else if (u.section === 'FEMALE_LEAD') {
      const d = u.data;
      if (d.name) summaries.push(`이름: ${d.name}`);
      if (d.age || d.role) summaries.push(`신분: ${d.age || ''} ${d.role || ''}`.trim());
      if (d.speechStyle) summaries.push(`말투: "${d.speechStyle.slice(0, 35)}..."`);
      if (d.appearance) summaries.push(`외모: "${d.appearance.slice(0, 35)}..."`);
      if (d.personality) summaries.push(`성격: "${d.personality.slice(0, 35)}..."`);
    } else if (u.section === 'SUPPORTING_CAST') {
      const list = Array.isArray(u.data) ? u.data : [u.data];
      const recent = list.length > 0 ? list[list.length - 1] : null;
      if (recent) {
        summaries.push(`인물: ${recent.name} [원형: ${recent.archetype || '조력자'}] (역할: ${recent.role || '보조인물'})`);
        if (recent.relationship) summaries.push(`관계: ${recent.relationship}`);
        if (recent.appearingParts) summaries.push(`등장 부: ${recent.appearingParts.join(', ')}부`);
      } else {
        summaries.push(`보조인물 총 ${list.length}명 갱신`);
      }
    } else if (u.section === 'STYLE_AND_TIME') {
      const d = u.data;
      if (d.mainSetting) summaries.push(`주요 무대: "${d.mainSetting.slice(0, 35)}..."`);
      if (d.toneStyle) summaries.push(`문체: "${d.toneStyle.slice(0, 30)}..."`);
      if (d.eventYear) summaries.push(`사건 연도: ${d.eventYear}년`);
      if (d.writingTense) summaries.push(`작성 시제: ${d.writingTense}`);
      if (d.eventPov) summaries.push(`사건 시점: ${d.eventPov}`);
      if (d.writingYear) summaries.push(`작성/회고 연도: ${d.writingYear}년`);
    } else if (u.section === 'META_BASIC') {
      const d = u.data;
      if (d.title) summaries.push(`제목: "${d.title}"`);
      if (d.tags) summaries.push(`태그: ${d.tags.join(', ')}`);
    }
  }
  return summaries;
}

function deepParseSupportingCastFromText(text: string, currentList: SupportingCharacter[]): SupportingCharacter[] {
  const clean = text.replace(/\[보조인물\]|\[조연\]|\[주변인물\]/g, '').trim();

  let name = '새로운 인물';
  const namePatterns = [
    /(?:이름\s*[:=은는이가]\s*)([가-힣]{2,4})/i,
    /(?:인물\s*[:=은는이가]\s*)([가-힣]{2,4})/i,
    /([가-힣]{2,4})\s*(?:목사|권사|장로|집사|전도사|회장|부회장|선배|후배|친구|교사|교수)/
  ];
  for (const p of namePatterns) {
    const m = clean.match(p);
    if (m && m[1] && !['이름', '보조', '인물', '조연', '원형'].includes(m[1])) {
      name = m[1].trim();
      break;
    }
  }

  let archetype: ArchetypeRole = '조력자';
  if (clean.includes('문턱 수호자') || clean.includes('문턱수호자') || clean.includes('감시자') || clean.includes('시험')) {
    archetype = '문턱 수호자';
  } else if (clean.includes('그림자') || clean.includes('적대자') || clean.includes('악역') || clean.includes('라이벌')) {
    archetype = '그림자';
  } else if (clean.includes('변신자') || clean.includes('배신') || clean.includes('이중')) {
    archetype = '변신자';
  } else if (clean.includes('전령') || clean.includes('메신저') || clean.includes('소식')) {
    archetype = '전령';
  } else if (clean.includes('책략가') || clean.includes('트릭스터') || clean.includes('돌발')) {
    archetype = '책략가';
  } else if (clean.includes('영웅')) {
    archetype = '영웅';
  } else if (clean.includes('조력자') || clean.includes('멘토') || clean.includes('후원자')) {
    archetype = '조력자';
  }

  let role = '교회 관계자';
  const roleMatch = clean.match(/(담임목사|목사|청년부\s*회장|성가대\s*총무|성가대\s*반주자|집사|권사|장로|교사|동료|친구|선배|후배)/);
  if (roleMatch) {
    role = roleMatch[1].trim();
  }

  let appearingParts: number[] = [1];
  if (clean.includes('2부') && clean.includes('1부')) {
    appearingParts = [1, 2];
  } else if (clean.includes('2부') || clean.includes('제2부')) {
    appearingParts = [2];
  } else if (clean.includes('전체') || clean.includes('모든 부') || clean.includes('1, 2부')) {
    appearingParts = [1, 2];
  }

  const relationship = clean.length > 30 ? clean.slice(0, 60) : `${role}로서 주인공들과 얽히는 관계`;
  const notes = clean;

  const newChar: SupportingCharacter = {
    id: `supp-${Date.now()}`,
    name,
    archetype,
    role,
    relationship,
    notes,
    appearingParts
  };

  const existsIndex = currentList.findIndex(c => c.name === name);
  if (existsIndex >= 0) {
    const copy = [...currentList];
    copy[existsIndex] = { ...copy[existsIndex], ...newChar, id: copy[existsIndex].id };
    return copy;
  }
  return [...currentList, newChar];
}

function deepParseStyleFromText(text: string, current: WorldbuildingState): Record<string, any> {
  const clean = text.replace(/\[스타일\]|\[문체\]|\[시점\]|\[시제\]|\[무대\]/g, '').trim();
  const data: Record<string, any> = {};

  const settingMatch = clean.match(/(?:주요\s*무대[는은\s:]*|무대[는은\s:]*|배경[은는\s:]*|공간[은는\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
  if (settingMatch && settingMatch[1]) {
    data.mainSetting = settingMatch[1].trim();
  } else if (clean.includes('성가대실') || clean.includes('사택') || clean.includes('교회') || clean.includes('기도원') || clean.includes('자모실')) {
    data.mainSetting = clean;
  }

  const eventYrMatch = clean.match(/(?:사건\s*(?:발생\s*)?연도[는은\s:]*|사건\s*시점[은는\s:]*|배경\s*연도[는은\s:]*)(\d{4})/);
  if (eventYrMatch && eventYrMatch[1]) {
    data.eventYear = eventYrMatch[1];
  } else {
    const rawYr = clean.match(/(20\d{2})/);
    if (rawYr && rawYr[1]) {
      data.eventYear = rawYr[1];
    }
  }

  const writingYrMatch = clean.match(/(?:작성\s*(?:회고\s*)?시점[은는\s:]*|회고\s*연도[는은\s:]*)(\d{4})/);
  if (writingYrMatch && writingYrMatch[1]) {
    data.writingYear = writingYrMatch[1];
  }

  if (clean.includes('과거형') || clean.includes('회고체')) {
    data.writingTense = '과거형 위주의 긴장감 있는 어조 (회고체 결합)';
  } else if (clean.includes('현재형')) {
    data.writingTense = '생생하고 긴박한 현재형 어조';
  } else {
    const tenseMatch = clean.match(/(?:작성\s*시제[는은\s:]*|시제[는은\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
    if (tenseMatch && tenseMatch[1]) {
      data.writingTense = tenseMatch[1].trim();
    }
  }

  if (clean.includes('1인칭') || clean.includes('손세미 시점') || clean.includes('여주 시점')) {
    data.eventPov = '1인칭 주인공 시점 (손세미 시점) 및 3인칭 전지적 시점 교차';
  } else if (clean.includes('3인칭') || clean.includes('전지적')) {
    data.eventPov = '3인칭 전지적 관찰자 시점';
  } else {
    const povMatch = clean.match(/(?:사건\s*시점[는은\s:]*|서술\s*시점[은는\s:]*|시점[은는\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
    if (povMatch && povMatch[1]) {
      data.eventPov = povMatch[1].trim();
    }
  }

  const toneMatch = clean.match(/(?:문체[는은\s:]*|연출[은는\s:]*|톤[은는\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
  if (toneMatch && toneMatch[1]) {
    data.toneStyle = toneMatch[1].trim();
  } else {
    data.toneStyle = clean;
  }

  return data;
}

function deepParseCharacterFromText(
  text: string,
  type: 'MALE' | 'FEMALE',
  current: WorldbuildingState['maleLead'] | WorldbuildingState['femaleLead']
) {
  const clean = text.replace(/\[남성주인공\]|\[여성주인공\]|\[남주\]|\[여주\]/g, '').trim();
  const updated = { ...current };

  const namePatterns = [
    /(?:이름\s*[:=은는이가]\s*|\b)([가-힣]{2,4})(?=\s*(?:전도사|교사|선생님|목사|신학생|사역자|학생|팀장|대표|씨|님|\d{1,2}세|\d{1,2}살|\(|,))/i,
    /(?:이름\s*[:=은는이가]\s*)([가-힣]{2,4})/i,
    /(?:남주|여주|주인공)\s*[:=은는이가\s]*([가-힣]{2,4})/i
  ];
  for (const p of namePatterns) {
    const m = clean.match(p);
    if (m && m[1] && !['이름', '남주', '여주', '주인공', '남자', '여자'].includes(m[1])) {
      updated.name = m[1].trim();
      break;
    }
  }

  const ageMatch = clean.match(/(\d{1,2}\s*세|\d{1,2}\s*살|스물[가-힣]*\s*살|서른[가-힣]*\s*살)/);
  if (ageMatch) {
    updated.age = ageMatch[1].trim();
  }

  const roleMatch = clean.match(/(신학대학원생|신학생|전도사|사역자|고등학교\s*교사|교사|선생님|음악\s*강사|찬양팀\s*리더|목사|교수|의사|팀장)/);
  if (roleMatch) {
    updated.role = roleMatch[1].trim();
  }

  const speechMatch = clean.match(/(?:말투[는은\s:]*|어투[는은\s:]*|대사[는은\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
  if (speechMatch && speechMatch[1]) {
    updated.speechStyle = speechMatch[1].trim();
  } else {
    const quoteMatch = clean.match(/(["“][^"”]+["”])/);
    if (quoteMatch) {
      updated.speechStyle = `${quoteMatch[1]} 같은 어투를 주로 사용함.`;
    } else {
      updated.speechStyle = clean.length > 50 ? clean.slice(0, 100) : clean;
    }
  }

  updated.personality = clean;

  const appearanceMatch = clean.match(/(?:외모[는은\s:]*|인상[은는\s:]*|체격[은는\s:]*)([^.\n]+(?:[.!?]|\n|$))/);
  if (appearanceMatch && appearanceMatch[1]) {
    updated.appearance = appearanceMatch[1].trim();
  } else if (!updated.appearance) {
    updated.appearance = type === 'MALE'
      ? '단정한 셔츠 차림, 서늘하고 냉철한 눈매, 핏줄이 도드라진 손목'
      : '창백하고 단아한 얼굴선, 가녀린 목덜미와 흐트러진 호흡';
  }

  return updated;
}

export async function askAiCopilot(
  userQuery: string,
  currentState: {
    world: WorldbuildingState;
    episodes: EpisodeCard[];
    currentStep: number;
    modelConfig?: ModelConfig;
  }
): Promise<{
  replyText: string;
  proposedAction?: ChatProposedAction;
  targetedSections?: Step1Section[];
}> {
  const explicitTags = extractStep1TargetSections(userQuery);
  const ai = getAiClient();
  const config = currentState.modelConfig || {
    modelName: 'gemini-2.5-flash',
    temperature: 0.85,
    topP: 0.95,
    thinkingBudget: 0,
    maxOutputTokens: 3500,
  };

  const targetConstraintNotice = explicitTags.length > 0
    ? `\n[★ 절대 불변 규칙 - 지정된 섹션만 격리 수정]:
사용자가 ${explicitTags.map(t => `[${t}]`).join(', ')} 태그를 지정했습니다.
**반드시 updates 배열에는 [${explicitTags.join(', ')}] 섹션만 포함해야 하며, 그 외의 다른 섹션은 절대로 포함하거나 건드리지 마십시오!**
사용자가 입력한 글의 맥락을 깊이 있게 독해하여 지정된 섹션의 모든 세부 속성을 구체적으로 채워넣으세요.`
    : '';

  const systemInstruction = `
당신은 한국 최고 수준의 웹소설 기획 및 집필 AI 어시스턴트(Co-pilot)입니다.
사용자가 채팅창에 입력한 글을 철저하게 독해하여, 대시보드 Step 1에 반영할 정밀한 JSON 액션을 생성하세요.

[현재 소설 정보]
- 제목: "${currentState.world.title}"
- 태그: [${currentState.world.tags.join(', ')}]
- 주요 무대: "${currentState.world.mainSetting}"
- 현재 남성 주인공: ${JSON.stringify(currentState.world.maleLead)}
- 현재 여성 주인공: ${JSON.stringify(currentState.world.femaleLead)}
- 현재 보조 인물(${currentState.world.supportingCharacters.length}명): ${JSON.stringify(currentState.world.supportingCharacters)}
${targetConstraintNotice}

[섹션별 필드 작성 규격]:
1. "MALE_LEAD":
   { "name": "이름", "age": "나이", "role": "역할", "personality": "성격/지배성향", "appearance": "외모", "speechStyle": "구체적 대사 말투" }
2. "FEMALE_LEAD":
   { "name": "이름", "age": "나이", "role": "역할", "personality": "성격/피학내면", "appearance": "외모", "speechStyle": "구체적 대사 말투" }
3. "SUPPORTING_CAST":
   [기존 인물들..., { "id": "supp-${Date.now()}", "name": "이름", "archetype": "조력자" | "문턱 수호자" | "그림자" | "변신자" | "전령" | "책략가" | "영웅", "role": "직책/역할", "relationship": "관계", "notes": "위기 요인 및 상호작용", "appearingParts": [1] 또는 [2] 또는 [1, 2] }]
4. "STYLE_AND_TIME":
   { "toneStyle": "문체/연출", "mainSetting": "주요 무대", "eventPov": "사건 시점", "eventYear": "사건 발생 연도(예: 2019)", "writingYear": "작성/회고 연도(예: 2024)", "writingTense": "작성 시제(예: 과거형)" }
5. "META_BASIC":
   { "title": "제목", "tags": ["태그1", "태그2"], "targetAudience": "타겟층" }

응답 맨 마지막에 반드시 다음 JSON 코드 블록을 제공하세요:
\`\`\`json
{
  "actionType": "UPDATE_STEP1_MULTI_SECTIONS",
  "payload": {
    "updates": [
      {
        "section": "지정된_섹션",
        "data": { ... }
      }
    ]
  }
}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: config.modelName,
      contents: {
        role: 'user',
        parts: [{ text: userQuery }],
      },
      config: {
        systemInstruction,
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens || 3500,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const fullText = response.text || '';
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    let parsedAction: any = undefined;
    let cleanReply = fullText;
    let targetedSections = explicitTags;

    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedAction = JSON.parse(jsonMatch[1]);
        cleanReply = fullText.replace(/```json[\s\S]*?```/, '').trim();

        if (parsedAction.payload?.updates && explicitTags.length > 0) {
          parsedAction.payload.updates = parsedAction.payload.updates.filter((u: any) =>
            explicitTags.includes(u.section)
          );
          targetedSections = parsedAction.payload.updates.map((u: any) => u.section);
        }
      } catch (e) {
        console.warn('JSON parsing error in action block', e);
      }
    }

    if (!parsedAction || !parsedAction.payload?.updates || parsedAction.payload.updates.length === 0) {
      const generatedUpdates: Step1SectionUpdate[] = [];

      if (explicitTags.includes('SUPPORTING_CAST') || userQuery.includes('보조인물') || userQuery.includes('조연')) {
        const parsedList = deepParseSupportingCastFromText(userQuery, currentState.world.supportingCharacters);
        generatedUpdates.push({
          section: 'SUPPORTING_CAST',
          data: parsedList
        });
        targetedSections = ['SUPPORTING_CAST'];
      }

      if (explicitTags.includes('STYLE_AND_TIME') || userQuery.includes('스타일') || userQuery.includes('문체') || userQuery.includes('무대') || userQuery.includes('시점') || userQuery.includes('시제')) {
        const parsedStyle = deepParseStyleFromText(userQuery, currentState.world);
        generatedUpdates.push({
          section: 'STYLE_AND_TIME',
          data: parsedStyle
        });
        if (!targetedSections.includes('STYLE_AND_TIME')) targetedSections.push('STYLE_AND_TIME');
      }

      if (explicitTags.includes('MALE_LEAD') || userQuery.includes('[남성주인공]')) {
        const parsedMale = deepParseCharacterFromText(userQuery, 'MALE', currentState.world.maleLead);
        generatedUpdates.push({
          section: 'MALE_LEAD',
          data: parsedMale
        });
        if (!targetedSections.includes('MALE_LEAD')) targetedSections.push('MALE_LEAD');
      }

      if (explicitTags.includes('FEMALE_LEAD') || userQuery.includes('[여성주인공]')) {
        const parsedFemale = deepParseCharacterFromText(userQuery, 'FEMALE', currentState.world.femaleLead);
        generatedUpdates.push({
          section: 'FEMALE_LEAD',
          data: parsedFemale
        });
        if (!targetedSections.includes('FEMALE_LEAD')) targetedSections.push('FEMALE_LEAD');
      }

      if (generatedUpdates.length > 0) {
        parsedAction = {
          actionType: 'UPDATE_STEP1_MULTI_SECTIONS',
          payload: { updates: generatedUpdates }
        };
      }
    }

    let proposedAction: ChatProposedAction | undefined = undefined;
    if (parsedAction && parsedAction.payload?.updates && parsedAction.payload.updates.length > 0) {
      const summaries = createSectionChangeSummaries(parsedAction.payload.updates);
      const titleMap: Record<string, string> = {
        'MALE_LEAD': '남성 주인공',
        'FEMALE_LEAD': '여성 주인공',
        'SUPPORTING_CAST': '보조 인물',
        'STYLE_AND_TIME': '스타일 및 주요 무대',
        'META_BASIC': '제목 및 태그'
      };
      const targetTitle = targetedSections.map(t => titleMap[t] || t).join(', ') || '설정 갱신';

      proposedAction = {
        type: parsedAction.actionType || 'UPDATE_STEP1_MULTI_SECTIONS',
        payload: parsedAction.payload,
        summaryTitle: targetTitle,
        details: summaries
      };
    }

    return {
      replyText: cleanReply || `입력하신 글을 바탕으로 [${targetedSections.join(', ')}] 세부 사항을 완벽히 독해하여 정리했습니다. 아래 [대시보드에 반영하기] 버튼을 누르시면 즉시 대시보드에 채워집니다.`,
      proposedAction,
      targetedSections
    };
  } catch (err: any) {
    console.error('Gemini Co-pilot API Error:', err);
    // 정적 환경이나 API 키 부재 시에도 멈추지 않는 로컬 파서 구동
    const generatedUpdates: Step1SectionUpdate[] = [];
    if (explicitTags.includes('MALE_LEAD') || userQuery.includes('[남성주인공]')) {
      generatedUpdates.push({ section: 'MALE_LEAD', data: deepParseCharacterFromText(userQuery, 'MALE', currentState.world.maleLead) });
    }
    if (explicitTags.includes('FEMALE_LEAD') || userQuery.includes('[여성주인공]')) {
      generatedUpdates.push({ section: 'FEMALE_LEAD', data: deepParseCharacterFromText(userQuery, 'FEMALE', currentState.world.femaleLead) });
    }
    if (explicitTags.includes('SUPPORTING_CAST') || userQuery.includes('[보조인물]')) {
      generatedUpdates.push({ section: 'SUPPORTING_CAST', data: deepParseSupportingCastFromText(userQuery, currentState.world.supportingCharacters) });
    }
    if (explicitTags.includes('STYLE_AND_TIME') || userQuery.includes('[스타일]')) {
      generatedUpdates.push({ section: 'STYLE_AND_TIME', data: deepParseStyleFromText(userQuery, currentState.world) });
    }

    const summaries = createSectionChangeSummaries(generatedUpdates);
    return {
      replyText: `[오프라인 엔진 구동] 입력하신 내용을 바탕으로 설정을 도출했습니다. 아래 [대시보드에 반영하기] 버튼을 눌러 적용하세요.`,
      proposedAction: {
        type: 'UPDATE_STEP1_MULTI_SECTIONS',
        payload: { updates: generatedUpdates },
        summaryTitle: explicitTags.join(', ') || '설정 갱신',
        details: summaries
      },
      targetedSections: explicitTags
    };
  }
}

export async function generatePartInstructionAI(
  world: WorldbuildingState,
  partNumber: number
): Promise<string> {
  const ai = getAiClient();
  const currentPart = (world.parts || []).find(p => p.partNumber === partNumber);

  const promptText = `
당신은 한국 웹소설 전문 메인 디렉터입니다.
Step 1에 기획된 세계관 설정을 바탕으로, **[${partNumber}부 전체 에피소드 집필에 공통 적용될 핵심 지침]**을 2~3문장으로 집필해 주세요.

[소설 설정]:
- 소설 제목: "${world.title}"
- 주요 무대: "${world.mainSetting || '주사랑 개신교회 성가대실 및 사택'}"
- 스타일/문체: "${world.toneStyle || '배덕감 어린 긴장감, 종교적 경건함과 농밀한 관능미'}"
- 주요 타겟 독자층: "${world.targetAudience || '20-30대 고수위 피폐·배덕 로맨스 독자층'}"
- 사건 연도/시점: ${world.eventYear}년 배경 (${world.eventPov}) / 시제: ${world.writingTense}
- ${partNumber}부 제목/개요: "${currentPart?.title || `${partNumber}부`}" - "${currentPart?.description || ''}"
- 남주: ${world.maleLead.name || '최창환'} (말투: ${world.maleLead.speechStyle || '단정한 명령조'})
- 여주: ${world.femaleLead.name || '손세미'} (말투: ${world.femaleLead.speechStyle || '애원하는 복종조'})

[필수 요구사항]:
1. **[주요 타겟 독자층]에게 은밀히 말을 건네는 독백/방백 서술 방식**을 어떻게 구체적으로 펼칠 것인지 명시할 것.
2. 주요 무대("${world.mainSetting}")의 폐쇄성과 사제지간 조교의 배덕감 연출 방향을 제시할 것.
3. 오직 지침 본문 텍스트만 간결하고 명확하게 출력할 것.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
    });

    return response.text?.trim() || `${partNumber}부 전체는 ${world.mainSetting || '교회 성가대실'}의 폐쇄된 공간 안에서 타겟 독자층(${world.targetAudience})에게 비밀을 털어놓듯 말을 건네는 화법을 유지하며, 최창환의 차가운 훈육과 손세미의 피학적 굴복을 긴장감 넘치게 연출할 것.`;
  } catch (err) {
    return `${partNumber}부 전체는 ${world.mainSetting || '주사랑교회 성가대실'}을 주요 무대로 하여, 타겟 독자층(${world.targetAudience})에게 관음적 공범 의식을 심어주는 말걸기 서술을 펼치며, 최창환 전도사의 냉혹한 존댓말 명령조와 손세미 교사의 애원하는 복종조 대사 텐션을 최고조로 유지할 것.`;
  }
}

export async function generateRecommendedTagsAI(world: WorldbuildingState): Promise<string[]> {
  const ai = getAiClient();

  const promptText = `
당신은 한국 웹소설 시장 트렌드에 정통한 웹소설 전문 기획자입니다.
아래의 [남성주인공], [여성주인공], [보조인물], [스타일] 설정을 정밀하게 분석하여, 독자 유입과 클릭률을 극대화할 수 있는 강력한 키워드 태그 5~8개를 추천해 주세요.

[소설 설정]:
- 작품 제목: "${world.title}"
- 남주: ${world.maleLead.name || '최창환'} (${world.maleLead.role || '전도사'}, 성격: ${world.maleLead.personality}, 말투: ${world.maleLead.speechStyle})
- 여주: ${world.femaleLead.name || '손세미'} (${world.femaleLead.role || '교사'}, 성격: ${world.femaleLead.personality}, 말투: ${world.femaleLead.speechStyle})
- 보조인물: ${world.supportingCharacters.map(s => `${s.name}(${s.archetype}, ${s.role})`).join(', ') || '없음'}
- 스타일 및 주요 무대: ${world.mainSetting || '교회 성가대실/사택'} / 문체: ${world.toneStyle} / 배경: ${world.eventYear}년

기존에 등록되어 있는 태그: [${world.tags.join(', ')}]

지침:
1. 기존 태그와 중복되지 않으면서, 위 설정의 사제지간, 교회 배덕감, 관능미, 서사적 특성을 찌르는 쫀득한 해시태그를 도출하세요.
2. 반드시 JSON 배열 형태의 문자열 목록으로만 반환하세요:
["태그1", "태그2", "태그3", "태그4", "태그5"]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((t: string) => t.replace(/^#/, '').trim());
    }
    throw new Error('Invalid tags array');
  } catch (err) {
    return ['비밀밀회', '절대복종', '성가대실조교', '금기의서약', '배덕감극대화', '피폐로맨스'];
  }
}

export async function generateChapterDraftWithTitle(
  world: WorldbuildingState,
  episode: EpisodeCard,
  volume: VolumeLevel,
  sensual: SensualLevel,
  partInstruction: string = '',
  modelConfig?: ModelConfig
): Promise<{ content: string; generatedTitle: string }> {
  const ai = getAiClient();
  const config = modelConfig || {
    modelName: 'gemini-2.5-flash',
    temperature: 0.9,
    topP: 0.95,
    thinkingBudget: 0,
    maxOutputTokens: 6000,
  };

  const currentPart = episode.part || 1;
  const applicableSupp = world.supportingCharacters.filter(s =>
    (s.appearingParts || [1]).includes(currentPart)
  );

  const maleName = world.maleLead.name || '최창환';
  const femaleName = world.femaleLead.name || '손세미';
  const targetAudience = world.targetAudience || '20-30대 고수위 피폐·배덕 로맨스 독자층';

  const volumeGuide: Record<VolumeLevel, string> = {
    '100%': '공백 포함 약 2,500자 ~ 3,200자의 밀도 높은 웹소설 1화 확장 기본 분량.',
    '125%': '공백 포함 약 4,000자 ~ 4,800자의 디테일한 대사와 씬 묘사가 대폭 확장된 분량.',
    '150%': '공백 포함 약 5,600자 ~ 6,900자의 심도 깊은 심리선과 성애적 상황이 포함된 상세 대분량.',
    '175%': '공백 포함 약 8,000자 ~ 8,500자 내외의 장대한 씬 연출과 사건 빌드업의 초대형 분량.',
    '200%': '공백 포함 약 10,000자 이상의 극대화된 분량, 모든 제스처와 숨결, 내면 갈등, 관능적 긴장과 성애의 절정을 극도로 풀어낸 완결 분량.'
  };

  const sensualGuide: Record<SensualLevel, string> = {
    '100%': '은밀한 시선과 침묵을 넘어선 끈적하고 농밀한 신체적 긴장감, 스치는 손길과 옷자락 아래의 숨 막히는 맥박과 떨림 묘사.',
    '125%': '노골적인 신체 접촉과 거친 애무, 헐떡이는 호흡과 복종의 신음, 주종 관계 아래 무릎 꿇린 채 은밀히 달아오르는 육체적 굴복과 통제 대사 강조.',
    '150%': '매우 적나라하고 음탕한 성애 묘사, 교사 손세미의 도덕적 체면과 수치심을 짓밟는 천박하고 질척한 신체 결합, 타액과 애액의 묘사, 엄격한 훈육과 사제 간의 배덕적 교구 서술 가미.',
    '175%': '극도로 높은 수위의 관능과 천박한 묘사, 성스러운 교회/성가대실과 대비되는 음란하고 저열한 성애 체위, 애원을 무시하는 최창환의 거친 결박과 지배, 수치심 속에서 자지러지는 피학적 오르가즘과 신음 묘사.',
    '200%': '필터링 없는 극도의 음탕함과 천박함의 극치! 날것 그대로의 원초적 갈망과 저열한 육욕 묘사, 교사 손세미의 완전한 암캐화와 최창환의 무자비한 사정 및 육체적 낙인, 숨김없는 감각과 체액, 질척거리는 마찰음의 극한 묘사!'
  };

  const promptText = `
당신은 한국 웹소설계 최고의 고수위 로맨스/피폐/배덕물 전문 작가입니다.
아래에 제공된 **[Step 1의 5대 메타 설정 전체]** 및 **[★ ${currentPart}부 전체 지침]**을 100% 반영하여, 독자를 숨 막히게 몰입시키는 본문을 집필하고 어울리는 에피소드 제목을 생성해 주세요.

==================================================
[★ 필수 서술 블록: <imagination> [저자의 상상]과 <reminiscence> [저자의 과거 회상] 태그 구분 규칙]
이야기 전개 중, 저자(손세미)의 특별한 내면 심리를 아래 두 가지 전용 태그로 반드시 명확히 구분하여 작성하세요:

1. **[저자가 상상하는 내용] - 태그: <imagination> ... </imagination>**
   - 청순한 여교사 손세미가 현실의 가식과 체면 속에서 속으로만 떠올리는 **극단적인 피학적 성적 망상, 최창환 전도사에게 완전히 굴복당해 짓밟히는 은밀하고 음탕한 상상** 구절.
2. **[저자가 회상하는 내용] - 태그: <reminiscence> ... </reminiscence>**
   - 저자 손세미가 현재 시점에서 **과거의 특정 사건이나 최창환과 처음 얽혔던 날의 서늘한 기억, 과거 예배당에서의 숨 막히던 첫 순간을 되돌아보는 과거 회상** 구절.

* 본문 내에 두 태그를 적절한 타이밍에 자연스럽게 배치하십시오. 이 태그들은 뷰어에서 단정하게 구분 표기되며, 독자 댓글에서도 명확히 인지됩니다.

==================================================
[★ 최우선 집필 서술 기법: 주요 타겟 독자층에게 직접 말을 건네는 서술 방식]
- 타겟 독자: "${targetAudience}"
- **서술 스타일 지침**:
  소설의 지문과 내레이션 속에서, 작가 또는 1인칭 화자가 **[${targetAudience}]에게 은밀하게 귓속말을 하거나 말을 건네는 독백·방백식의 대화형 서술 어조(예: "당신도 알다시피...", "상상해 보세요, 그 단정한 얼굴 뒤에 감춰진...", "그 밤, 우리가 왜 선을 넘을 수밖에 없었는지 당신이라면 이해하겠죠?", "보이시나요?", "당신이 그 자리에 서 있었다면 어땠을까요?")**를 문장 곳곳에 유려하게 삽입하여, 독자가 관음증적 공범이 된 듯한 강렬한 심리적 밀착감을 유도하세요!

==================================================
[1. 소설 메타 설정]
- 소설 제목: "${world.title || '안녕하세요, 청순한 여교사 손세미입니다'}"
- 핵심 장르 태그: [${world.tags.join(', ') || '사제지간, 연상녀연하남, 개신교회 연애물, 메조히스트여성, 조교물'}]
- 현재 회차 소속 부: ${currentPart}부 (Stage ${episode.stageNumber} - Sub #${episode.subNumber})

[2. 남성 주인공 설정 (남주)]
- 이름: ${maleName}
- 나이 및 역할: ${world.maleLead.age || '24세'} / ${world.maleLead.role || '신학대학원생 및 청년부 사역자(전도사)'}
- 성격 및 지배 성향: ${world.maleLead.personality || '단정하고 차가운 소유욕, 말씀과 계율 아래 무릎 꿇리려는 도미넌트'}
- 외모: ${world.maleLead.appearance || '검은 셔츠, 핏줄이 도드라진 하얀 손목, 서늘한 눈매'}
- **[남주 대사 말투]**: ${world.maleLead.speechStyle || '나직하고 정중한 극존칭(“~하셨습니까, 선생님”, “고개를 숙이셔야죠”) 뒤의 차가운 명령조'}

[3. 여성 주인공 설정 (여주)]
- 이름: ${femaleName}
- 나이 및 역할: ${world.femaleLead.age || '32세'} / ${world.femaleLead.role || '고등학교 교사 및 교회 찬양팀 리더'}
- 성격 및 내면: ${world.femaleLead.personality || '청순한 교사 가면 뒤 피학적 굴복과 열락을 갈망하는 성향'}
- 외모: ${world.femaleLead.appearance || '창백하고 단아한 얼굴선, 가녀린 목덜미와 굴곡진 체형'}
- **[여주 대사 말투]**: ${world.femaleLead.speechStyle || '사회적 체면과 숨 막히는 애원조(“전도사님, 제발... 잘못했어요”)'}

[4. 보조 인물 (영웅의 여정 7대 원형)]
${applicableSupp.length > 0 ? applicableSupp.map(s => `- [원형: ${s.archetype}] ${s.name} (역할: ${s.role}): ${s.relationship} (상호작용: ${s.notes})`).join('\n') : '이 부에 등장하는 보조인물 없음'}

[5. 스타일 및 주요 무대]
- **주요 무대**: "${world.mainSetting || '도심 외곽 주사랑 개신교회 (성가대실 피아노 앞, 인적 드문 자모실, 지하 기도실 및 사택)'}"
- 사건 연도/시제: ${world.eventYear || '2019'}년 배경 / ${world.writingTense || '과거형 위주의 긴장감 있는 어조'}
- 문체: ${world.toneStyle || '배덕감 어린 긴장감, 종교적 경건함과 농밀한 관능미의 대조'}
- 시점: ${world.eventPov || '1인칭 주인공 시점 및 3인칭 전지적 시점 교차'}

==================================================
[★ ${currentPart}부 전체 지침 (같은 부 내 공통 적용 지침)]:
"${partInstruction || '타겟 독자에게 은밀하게 말을 건네는 화법과 파격적인 성애의 배덕감을 극대화할 것.'}"

[에피소드 정보]
- 플롯 개요: ${episode.outline}
- 핵심 갈등: ${episode.keyConflict}
- 클라이맥스 포인트: ${episode.climaxPoint}

[집필 조절 파라미터 (1.25배 증폭)]:
- 분량 목표 (${volume}): ${volumeGuide[volume]}
- 수위 및 성애 묘사 (${sensual}): ${sensualGuide[sensual]}

반드시 다음 JSON 형식으로만 응답:
\`\`\`json
{
  "title": "제${episode.stageNumber}화: [본문의 핵심과 관능미를 찌르는 매혹적인 제목]",
  "content": "작성된 소설 본문 전체 텍스트..."
}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: config.modelName,
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens || 6000,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.content) {
      return {
        content: parsed.content,
        generatedTitle: parsed.title || `제${episode.stageNumber}화: 은밀한 계율의 시간`,
      };
    }
    throw new Error('Invalid JSON format');
  } catch (err: any) {
    return {
      generatedTitle: `제${episode.stageNumber}화: 성가대실의 닫힌 문 뒤에서`,
      content: `당신이라면 알 것입니다. 성스러운 예배당 안에서, 그것도 비가 쏟아지는 밤에 홀로 문을 잠그고 서 있는 여자의 심정을.

${world.eventYear || '2019'}년의 가을, 주사랑교회 성가대실은 유난히 어둡고 차가웠습니다.
건반 앞에 홀로 앉아 있던 손세미의 등 뒤로, 서늘한 발소리가 빗소리를 가르고 다가왔을 때... 당신도 그 전율을 상상할 수 있겠지요? 
스물네 살의 젊은 사역자, 최창환 전도사. 그가 검은 셔츠 소매를 걷어 올린 채 다가와 속삭였습니다.

"불도 켜지 않고 여기서 무얼 하고 계십니까, 선생님."

낮게 내려앉은 서늘한 음성이 귓가를 긁고 지나갔습니다. 세미는 메마른 입술을 달싹이며 더듬거렸습니다.
"창환 전도사님... 악보 정리가 아직 끝나지 않아서요..."

<reminiscence>
돌이켜보면 그때가 모든 파멸의 시작이었습니다. 반년 전 청년부 성경 공부 시간, 성경 구절을 손끝으로 가리키던 그의 새하얀 손가락과 마주쳤을 때부터 내 안의 무언가가 어긋나기 시작했음을... 그때 그의 차가운 눈빛이 내 가슴 깊은 곳을 꿰뚫어 보았을 때의 떨림이 지금도 생생하게 되살아납니다.
</reminiscence>

"거짓말을 하시는군요."
그의 긴 손가락이 건반 덮개를 소리 나지 않게 닫아내렸습니다. 
"기도를 드리러 온 표정은 아닌 것 같았는데 말입니다. 무릎부터 꿇으셔야죠."

<imagination>
순간, 머릿속에서 끔찍하도록 달콤한 망상이 폭풍처럼 휘몰아쳤습니다. 만약 그가 이 차가운 성가대 마룻바닥에 내 얇은 치마를 거칠게 걷어 올리고, 내 두 손목을 넥타이로 단단히 결박한 채 성경 구절을 읊으며 무자비하게 짓밟아준다면 어떨까. "선생님은 교단 위에서 학생들을 가르칠 자격이 없습니다. 오직 제 발치에서 애원하는 암캐일 뿐이죠." 그의 서늘한 음성에 자지러지듯 애원하며 눈물과 애액으로 마룻바닥을 적시는 내 꼴사나운 상상... 그 천박하고 질척한 파멸의 쾌락에 아랫배가 저릿하게 죄어들었습니다.
</imagination>

현실의 최창환은 여전히 차가운 눈빛으로 나를 내려다보고 있었습니다.
"손세미 선생님, 제 말이 들리지 않으십니까?"
그의 나직한 질책에 나는 숨을 헐떡이며 천천히 무릎을 굽혔습니다. 당신이 그 자리에 있었더라도, 숨을 멈출 수밖에 없었을 테지요.`,
    };
  }
}

export async function rewriteSelection(
  fullContext: string,
  selectedText: string,
  instruction: string,
  world: WorldbuildingState
): Promise<string> {
  const ai = getAiClient();

  const promptText = `
당신은 웹소설 전문 편집 AI입니다.
[남주 말투]: ${world.maleLead.speechStyle || '나직하고 단정한 존댓말 뒤에 차가운 명령조'}
[여주 말투]: ${world.femaleLead.speechStyle || '사회적 체면과 숨 막히는 애원조'}
[문체 및 시제]: ${world.toneStyle} / ${world.writingTense}
[주요 무대]: ${world.mainSetting}
[타겟 독자에게 말 걸기 어조 반영]: ${world.targetAudience}

[수정 대상 문장]: "${selectedText}"
[수정 지시]: "${instruction}"

오직 수정된 새로운 문장만 정확히 출력하십시오.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
    });
    return response.text?.trim() || selectedText;
  } catch (err) {
    return `${selectedText} (더욱 농밀하고 거친 숨결로 상대의 시선을 옭아매며)`;
  }
}

export async function generateRandomPersonaAI(
  platform: PlatformType,
  world: WorldbuildingState,
  userInstruction: string = ''
): Promise<CommenterPersona> {
  const ai = getAiClient();
  const isAcquaintance = platform === 'Acquaintance';

  const maleName = world.maleLead.name || '최창환';
  const femaleName = world.femaleLead.name || '손세미';

  const theqooArchetypes = [
    '도파민 처돌이 원덬: 남주 존댓말 명령조에 심장 터져서 대가리 깨며 오열하는 로설방 고인물 (ㅠㅠㅠㅠ 폭포수, 유죄인간, 입틀막)',
    '문장/감정선 짚어주는 도서방 분석러: 두 사람의 심리선, 시선 처리, 죄책감과 배덕감 묘사를 문학적으로 핥으며 감탄하는 지성파 독자',
    '츤데레 분노형 과몰입러: "남주 진짜 미친 놈 아니냐? 세미 쌤 도망쳐"라고 욕하면서도 다음 화 결제하고 제일 먼저 달리는 덬',
    '현생 파탄 난 직장인 덬: "내일 출근해야 되는데 새벽 3시에 이거 읽고 이불 쥐어뜯음", "오늘 회의 망했다"며 울부짖는 현실 피폐형 덬',
    '교회 고증 따지는 모태신앙 덬: "나 모태신앙인데 성가대실 닫힌 문 묘사 진짜 소름 돋게 리얼하다"며 교회 분위기 고증에 감탄하는 덬',
    '여주 피학 성향 지지자: "세미 쌤 더 굴러줘... 무릎 더 꿇어줘..." 하면서 배덕 쾌락에 솔직한 마니아 덬'
  ];

  const arcaliveArchetypes = [
    '챈 고인물 알파메일 숭배자: 남주의 거침없는 참교육과 도미넌트 무브에 "알파메일력 GOAT", "이궈궈던" 연발하는 챈러',
    '매운맛/자극성 감별사: 수위와 천박함, 암컷타락 묘사의 디테일(체액, 결박 등)을 나노 단위로 평가하며 개추 박는 꼴잘알 유저',
    '클리셰 파괴 분석러: 뻔한 개신교회물을 이렇게 배덕하고 딥다크하게 비틀어낸 전개 폼을 찬양하는 챈 분석가',
    '작가 협박 밈 유저: "다음 화 연참 안 달리면 작가 감금한다", "비축분 다 털어라"라며 날것의 챈 밈으로 도파민을 요구하는 유저',
    '순애 드립러: "서로 영혼까지 길들이는 거 보니까 이게 진짜 참된 순애다 ㄹㅇㅋㅋ"라며 비틀린 순애론을 설파하는 유저',
    '음슴체 단문 속사포 챈러: "퍄퍄퍄 개추 ㅋㅋㅋ 세미쉑 바로 조교 완료각 섰노" 등 짧고 강렬한 감탄사를 쏟아내는 유저'
  ];

  const acquaintanceArchetypes = [
    '성가대 옆자리 동료: 주일마다 단아한 가운 입고 거룩하게 찬양 부르던 손세미의 음탕한 속내에 꼴려서 흥분을 감추지 못하는 지인',
    '최창환을 아는 동기 신학생: 얌전하고 깍듯한 척하던 연하 최창환이 뒤에서 나이 많은 여교사를 무릎 꿇리고 주물렀다는 사실에 감탄하는 남성 지인',
    '손세미를 혼자 짝사랑했던 청년: 단정하게 거절당했던 손세미가 전도사 앞에서는 발칙하고 음탕하게 굴복했다는 상상에 미쳐 날뛰는 관음형 지인',
    '교회 청년부 임원: 소설 속 성가대실과 사택 밀회 장면을 현실의 두 사람 동선과 일일이 대조하며 소름 돋는 관음적 쾌락에 빠진 지인',
    '새벽기도 나오는 교회 형/누나: 거룩한 교회 공동체 안에서 벌어진 농밀한 배덕의 실체를 보며 극도의 흥분과 노골적인 성적 호기심을 불태우는 지인'
  ];

  const randomTheqooSeed = theqooArchetypes[Math.floor(Math.random() * theqooArchetypes.length)];
  const randomArcaSeed = arcaliveArchetypes[Math.floor(Math.random() * arcaliveArchetypes.length)];
  const randomAcquaintanceSeed = acquaintanceArchetypes[Math.floor(Math.random() * acquaintanceArchetypes.length)];

  const promptText = `
한국 웹소설 플랫폼/커뮤니티 카테고리 [${platform}]에서 활동하는 독자 페르소나 1명을 생성해 주세요.

[소설 설정]:
- 작품 제목: "${world.title}"
- 장르 태그: [${world.tags.join(', ')}]
- 남주: ${maleName} (${world.maleLead.role || '전도사'}) / 여주: ${femaleName} (${world.femaleLead.role || '교사'})
- 주요 무대: "${world.mainSetting || '주사랑 개신교회 성가대실 및 사택'}"

[★ 캐릭터 컨셉 다채로움 보장 지침]:
${userInstruction ? `작가의 직접 지정 지침: "${userInstruction}"` : `
이번 생성에서 특히 참고할 캐릭터 성향 영감:
- Theqoo일 경우 추천 아키타입: "${randomTheqooSeed}"
- ArcaLive일 경우 추천 아키타입: "${randomArcaSeed}"
- Acquaintance(교회 지인)일 경우 추천 아키타입: "${randomAcquaintanceSeed}"
`}

[플랫폼별 세부 어투 가이드]:
1. **Theqoo (더쿠)**:
   - 닉네임: '무명의 더쿠', '원덬', 또는 개성 있는 로설방 닉네임
   - 어투: "ㅠㅠㅠㅠ", "도라방스", "유죄인간", "대가리 팍팍", "심장 멎음", "작가님 제발" 등 생생한 더쿠 로설방 말투
2. **ArcaLive (아카라이브)**:
   - 닉네임: 챈 밈이 가미된 닉네임
   - 어투: 완전한 음슴체, "ㄹㅇㅋㅋ", "폼 미쳤다", "알파메일력 GOAT", "개추 박고 감", "이궈궈던"
3. **Acquaintance (교회 지인)**:
   - 손세미에 대한 걱정은 전혀 없고, 그녀의 음탕한 실체와 피학적 굴복에 대한 감탄과 노골적인 성적 흥분을 실제 지인에게 적나라하게 투사
4. **Novelpia (노벨피아)**: 연참 독촉러, 장르 빌드업 분석러, 고수위 묘사 찬양러
5. **RidiBooks (리디북스)**: 별점 5점 서평러, 해시태그 나열러, 피폐물 문학성 평가러

반드시 다음 JSON 형식으로만 반환:
{
  "name": "플랫폼 감성에 어울리는 개성적인 닉네임",
  "age": "20대 초반/중반/후반/30대 등",
  "gender": "여성/남성",
  "personality": "구체적이고 입체적인 성향 요약",
  "commentTone": "해당 페르소나의 독특한 개성과 어투가 100% 살아 숨 쉬는 시그니처 댓글 말투 예시"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.95,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: parsed.name || (platform === 'Theqoo' ? '무명의더쿠_로설방' : (platform === 'ArcaLive' ? '챈주_도파민흡수기' : '독자')),
      platform,
      age: parsed.age || '20대',
      gender: parsed.gender || (platform === 'Theqoo' ? '여성' : (platform === 'ArcaLive' ? '남성' : '무관')),
      personality: parsed.personality || (userInstruction || '과몰입 독자'),
      commentTone: parsed.commentTone || (platform === 'Theqoo'
        ? '아 미친거아님???ㅠㅠㅠㅠㅠㅠㅠ 남주 존댓말 씌앙롬 유죄인간아 내 심장 어쩔건데ㅠㅠ 손세미 쌤 떨릴 때 나 지금 대가리 팍팍 깨는 중임 하... 도파민 도라방스다 진짜'
        : (platform === 'ArcaLive'
          ? '캬ㅋㅋ 전도사쉑 피아노 덮개 닫으면서 무릎 꿇리는 거 알파메일력 GOAT네 ㄹㅇㅋㅋ 개추 박고 감'
          : '전개 폼 미쳤다 다음 화 당장 주세요')),
      avatarSeed: `seed-${Math.random()}`,
    };
  } catch (err) {
    return {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: platform === 'Theqoo' ? '무명의더쿠_로설방' : (platform === 'ArcaLive' ? '챈주_성경투척러' : '독자'),
      platform,
      age: '20대 후반',
      gender: '여성',
      personality: userInstruction || (platform === 'Theqoo' ? '대가리 깨며 과몰입하는 더쿠 로설방 고인물' : '도파민과 매운맛을 찾는 아카라이브 챈러'),
      commentTone: platform === 'Theqoo'
        ? '아 미친거아냐???ㅠㅠㅠㅠㅠㅠㅠ 아니 진짜 원덬이 지금 심장 부여잡고 대가리 팍팍 깨는 중임 하... 남주 존댓말로 서늘하게 턱 치켜올리는 거 보고 입틀막함;; 손세미 쌤 숨소리 파르르 떨릴 때 나만 온몸에 소름 돋음? 도파민 도라방스다 진짜 오늘 밤 다 샜음 작가님 제발 연참 좀ㅠㅠㅠㅠㅠㅠ'
        : '캬ㅋㅋ 전도사쉑 피아노 덮개 닫으면서 무릎 꿇리는 거 알파메일력 GOAT네 ㄹㅇㅋㅋ 청순여교사 바로 암컷타락 각 섰음 개추를 참을 수가 없노',
      avatarSeed: `seed-${Math.random()}`,
    };
  }
}

/**
 * Step 5 Binge-reading continuous comments generation
 * ★ 사용자 요구사항:
 * - 댓글 작성 시 [<imagination> 파트]라는 기계적 태그명을 절대 사용하지 않고, 자연스러운 [작가의 상상파트] 혹은 [손세미 쌤의 상상파트]라는 문학적 표현을 사용하여 댓글을 작성함!
 * - [작가의 과거 회상파트]도 정확히 구분 인지
 */
export async function generateBingeComments(
  episode: EpisodeCard,
  fullDraftContent: string,
  personas: CommenterPersona[],
  previousCommentsSummary: string,
  currentPartObj?: { partNumber: number; title: string; hiatusDuration?: string },
  world?: WorldbuildingState
): Promise<Array<{ personaId: string; content: string; upvotes: number; downvotes: number; rating?: number; isBest?: boolean }>> {
  const ai = getAiClient();

  const personasInfo = personas.map(p => {
    return `[ID: ${p.id}] [플랫폼: ${p.platform}] 닉네임: ${p.name} / 성향: ${p.personality} / 평소말투: ${p.commentTone}`;
  }).join('\n');

  const partNumber = episode.part || 1;
  const hiatusNote = (partNumber > 1 && currentPartObj?.hiatusDuration)
    ? `[★ 휴재/연재 간극 알림]: 이 회차는 ${partNumber - 1}부 완결 후 무려 [${currentPartObj.hiatusDuration}] 동안의 기나긴 휴재와 기다림 끝에 공개된 ${partNumber}부의 회차입니다!`
    : '';

  const isSohnSemiPov = (world?.eventPov && (world.eventPov.includes('1인칭') || world.eventPov.includes('손세미'))) || false;
  const authorIdentityNotice = isSohnSemiPov
    ? `
[★ 초특급 핵심 규칙: 작가가 바로 여주인공 '손세미' 본인임!]:
- 현재 소설의 사건 시점은 [손세미 1인칭 시점]입니다.
- 즉, **이 소설을 웹에 연재하고 있는 작가가 바로 소설 속에서 전도사 최창환에게 훈육받고 굴복당한 그 청순한 여교사 손세미 본인**이라는 충격적인 고백 수기임을 독자들은 명확히 알고 경악/흥분합니다!
`
    : '';

  const hasImaginationPart = fullDraftContent.includes('<imagination>');
  const hasReminiscencePart = fullDraftContent.includes('<reminiscence>');

  const promptText = `
당신은 대한민국 최고 수준의 웹소설 플랫폼 독자 반응 시뮬레이터입니다.
독자들은 이번에 **실제로 집필된 아래 에피소드 본문 텍스트 전체를 꼼꼼히 정독**하고, **본문의 서로 다른 장면, 대사, 그리고 특히 [작가의 상상파트]와 [작가의 과거 회상파트]를 명확히 이해하고** 댓글을 남깁니다.

[현재 에피소드]: ${partNumber}부 - ${episode.title}
${hiatusNote}
${authorIdentityNotice}

==================================================
[★ 본문 속 특수 서술 파트에 대한 독자 반응 규칙]:
1. **[작가의 상상파트] (<imagination> 구간)**:
   - 독자들은 절대 '<imagination>' 태그 이름을 쓰지 않고, 독자답게 **"[작가의 상상파트]", "[손세미 쌤의 상상파트]", "[망상 파트]"** 등으로 부릅니다.
   - 현실에서는 조신하게 무릎 꿇고 있으면서 속으로는 온갖 발칙하고 음탕한 성적 망상을 하던 손세미의 배덕한 심리에 놀라며 반응합니다.
2. **[작가의 과거 회상파트] (<reminiscence> 구간)**:
   - 독자들은 절대 '<reminiscence>' 태그 이름을 쓰지 않고, 독자답게 **"[작가의 과거 회상파트]", "[과거 회상 씬]", "[과거 회상]"** 등으로 부릅니다.
   - 손세미 작가가 과거 둘이 처음 얽혔던 순간이나 과거의 기억을 되짚는 서늘한 감정선과 빌드업에 깊이 몰입하며 반응합니다.
==================================================

[실제로 집필된 에피소드 본문 전문]:
"""
${fullDraftContent && fullDraftContent.trim() ? fullDraftContent : '성가대실에서 남주 최창환이 여교사 손세미의 턱을 쥐며 무릎 꿇리는 장면.'}
"""

[이전 회차까지의 독자 반응]: ${previousCommentsSummary || '배덕감 어린 텐션에 열광 중.'}
[참여 페르소나 독자단]:
${personasInfo}

==================================================
[★ 페르소나별 필수 댓글 지침]:
1. **[Acquaintance (교회 지인)]**: 손세미에 대한 걱정은 전혀 없고, 손세미의 음탕한 면모와 그녀의 [작가의 상상파트] 및 [작가의 과거 회상파트]에 대한 감탄과 노골적인 성적 흥분을 실제 지인에게 투사!
2. **[Theqoo (더쿠)]**: "ㅠㅠㅠㅠㅠㅠ", "원덬이 대가리 팍팍", "도파민 도라방스", [작가의 상상파트]와 [작가의 과거 회상파트] 및 대사에 심장 멎는 주접.
3. **[ArcaLive (아카라이브)]**: 20대 남성 이대남 챈러 어투("ㄹㅇㅋㅋ", "알파메일력 GOAT", "개추 박고 감", "암컷타락 망상 폼 미쳤노").
4. **다채로운 구성**: 독자마다 서로 다른 구절(현실 대사, 작가의 상상파트, 작가의 과거 회상파트, 스킨십 묘사)을 제각기 다르게 언급할 것!
==================================================

반드시 다음 JSON 배열 형식으로만 반환:
[
  {
    "personaId": "p-1",
    "content": "본문의 특정 구절이나 [작가의 상상파트], [작가의 과거 회상파트]를 자연스럽게 인용한 생생하고 다채로운 댓글 본문",
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
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error('Empty comments array');
  } catch (err) {
    return personas.map((p, idx) => ({
      personaId: p.id,
      content: p.platform === 'Acquaintance'
        ? `와 미쳤다 진짜... 손세미 쌤 중간에 들어간 작가의 상상파트랑 과거 회상파트 읽고 온몸에 소름 돋음 ㄷㄷ 평소에 얌전한 척 다 하더니 최창환 전도사한테 길들여지는 망상까지 하고 있었냐? 세미 쌤 진짜 상상 이상으로 음탕하고 발칙한 여자였네 존나 꼴린다 ㅋㅋㅋ`
        : (p.platform === 'Theqoo'
          ? `아 미친거아냐???ㅠㅠㅠㅠㅠㅠㅠ 아니 중간에 손세미 쌤 작가의 상상파트 수위 실화임??? 현실에선 덜덜 떨면서 속으로는 온갖 배덕한 망상 다 하고 있는 거 보고 나 지금 대가리 팍팍 깨는 중임 하... 도파민 도라방스다 진짜 오늘 밤 다 샜음ㅠㅠㅠㅠ`
          : (p.platform === 'ArcaLive'
            ? `캬ㅋㅋ 여주 혼자 작가의 상상파트에서 암컷타락 회로 돌리는 거 폼 미쳤네 ㄹㅇㅋㅋ 전도사 알파메일력 GOAT 인정함 개추 박음`
            : `${episode.title} 본문 속 작가의 상상파트 디테일 미쳤다... 손세미 작가님 연참 부탁드립니다!`)),
      upvotes: (idx + 1) * 23 + 12,
      downvotes: 1,
      rating: 5,
      isBest: idx === 0,
    }));
  }
}

export async function generateCommentRepliesAI(
  targetComments: EpisodeComment[],
  personas: CommenterPersona[],
  world: WorldbuildingState
): Promise<Array<{
  parentId: string;
  personaId: string;
  authorName: string;
  platform: PlatformType;
  content: string;
  replyToAuthor: string;
  upvotes: number;
}>> {
  const ai = getAiClient();

  const commentsInfo = targetComments.map((c, i) =>
    `[타겟 댓글 ${i + 1}] (ID: ${c.id}) 작성자: ${c.authorName} [플랫폼: ${c.platform}] / 본문: "${c.content}"`
  ).join('\n\n');

  const personasInfo = personas.map(p =>
    `[ID: ${p.id}] 닉네임: ${p.name} [플랫폼: ${p.platform}] / 말투: ${p.commentTone}`
  ).join('\n');

  const promptText = `
당신은 대한민국 웹소설 플랫폼의 리얼한 독자 댓글 대화(대댓글/답글) 시뮬레이터입니다.
아래에 제공된 **[타겟 댓글들]**에 대하여, 참여 페르소나들이 **서로의 닉네임을 직접 태그(@닉네임)**하면서 격렬하게 감상을 주고받는 **대댓글을 반드시 총 5개 이상 (5~8개)** 생성하세요!

[작품 정보]:
- 제목: "${world.title}"
- 배경: 손세미 교사와 최창환 전도사의 은밀한 사제지간 조교물 (손세미 1인칭 수기 및 [작가의 상상파트], [작가의 과거 회상파트] 포함)

[대댓글이 달릴 대상 댓글들]:
${commentsInfo}

[참여 페르소나 풀]:
${personasInfo}

[★ 필수 요구사항]:
1. **반드시 생성되는 총 대댓글 수는 최소 5개 이상 (5개 ~ 8개)**이어야 합니다! 각 타겟 댓글에 2~4개씩 대댓글이 달리게 하세요.
2. **모든 대댓글의 시작이나 내용 중에 상대방 닉네임을 @닉네임 형태로 반드시 태그**하세요! (예: "@${targetComments[0]?.authorName || '새벽기도3년차_원덬'} 헐 님도 거기서 소름 돋았음???")
3. 대댓글끼리도 서로 태그하며(A -> B -> C -> A) 꼬리에 꼬리를 무는 현실적인 커뮤니티 티키타카를 연출하세요.
4. 더쿠는 ㅠㅠ와 도라방스, 아카라이브는 음슴체와 ㄹㅇㅋㅋ, 교회 지인은 실제 지인의 음탕한 상상/회상에 대한 관음적 맞장구를 치세요.
5. 상상 파트를 언급할 때는 기계적 태그가 아니라 **"[작가의 상상파트]", "[작가의 과거 회상파트]", "[망상 파트]"** 등으로 표현하세요.

반드시 다음 JSON 배열 형식으로만 반환 (원소 개수 5개 이상):
[
  {
    "parentId": "대상 댓글의 ID",
    "personaId": "답글 작성자 페르소나 ID",
    "authorName": "답글 작성자 닉네임",
    "platform": "Theqoo" | "ArcaLive" | "Novelpia" | "RidiBooks" | "Acquaintance",
    "replyToAuthor": "태그된 상대 닉네임",
    "content": "@상대닉네임 실제 대댓글 내용...",
    "upvotes": 15
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length >= 5) {
      return parsed;
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      return ensureMinimumReplies(parsed, targetComments, personas);
    }
    throw new Error('Insufficient replies');
  } catch (err) {
    return generateFallbackReplies(targetComments, personas);
  }
}

function ensureMinimumReplies(existing: any[], targetComments: EpisodeComment[], personas: CommenterPersona[]) {
  const result = [...existing];
  let idx = 0;
  while (result.length < 5) {
    const parent = targetComments[idx % targetComments.length];
    const persona = personas[(idx + 2) % personas.length];
    const prevAuthor = result[result.length - 1]?.authorName || parent.authorName;

    result.push({
      parentId: parent.id,
      personaId: persona.id,
      authorName: persona.name,
      platform: persona.platform,
      replyToAuthor: prevAuthor,
      content: `@${prevAuthor} ${persona.platform === 'Theqoo' ? '맞아 ㅠㅠㅠㅠㅠ 손세미 쌤 작가의 상상파트 보고 진짜 심장 멎는 줄 알았음;; 도라방스다' : persona.platform === 'ArcaLive' ? 'ㄹㅇㅋㅋ 여주 상상파트 수위 보소 알파메일력 GOAT 인정' : '교회에서 둘이 마주칠 때 어색해하던 거 생각나서 배덕감 미침 ㄷㄷ'}`,
      upvotes: Math.floor(Math.random() * 20) + 5
    });
    idx++;
  }
  return result;
}

function generateFallbackReplies(targetComments: EpisodeComment[], personas: CommenterPersona[]) {
  const result: any[] = [];
  const templates = [
    { text: 'ㄹㅇ 공감합니다 ㅋㅋㅋ 특히 손세미 쌤 작가의 상상파트에서 진짜 심장 멎는 줄 알았음;;', votes: 24 },
    { text: '인정 ㅠㅠㅠㅠㅠ 겉으로는 교사 체면 지키면서 속으로는 온갖 음탕한 상상 다 하는 거 도파민 도라방스였음 하...', votes: 19 },
    { text: '님 진짜 교회 사람임??? 손세미 쌤 평소에 진짜 저렇게 얌전함? 썰 더 풀어주셈 ㄷㄷ', votes: 31 },
    { text: '성가대실 피아노 덮개 닫는 소리 날 때 진짜 발기할 뻔함 ㅋㅋㅋ 작가의 상상파트 꼴잘알 인정', votes: 16 },
    { text: '작가님 오늘 연참 안 해주면 진짜 현생 파탄 납니다 저 망상이 제발 현실 씬으로 이어지게 해주세요 ㅠㅠㅠㅠ', votes: 28 },
    { text: '이게 진짜 참된 사제지간 순애지 ㄹㅇㅋㅋ 다음 화 사택 밀회 씬 개같이 기대 중', votes: 22 }
  ];

  templates.forEach((tmpl, i) => {
    const parent = targetComments[i % targetComments.length];
    const persona = personas[i % personas.length];
    const prevAuthor = i > 0 ? personas[(i - 1) % personas.length].name : parent.authorName;

    result.push({
      parentId: parent.id,
      personaId: persona.id,
      authorName: persona.name,
      platform: persona.platform,
      replyToAuthor: prevAuthor,
      content: `@${prevAuthor} ${tmpl.text}`,
      upvotes: tmpl.votes
    });
  });

  return result;
}
