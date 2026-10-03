export type ArchetypeRole =
  | '영웅'          // 서사의 중심 축을 이끌거나 마주하는 주체
  | '조력자'        // 멘토, 정신적 후원자 혹은 은밀한 공모자
  | '문턱 수호자'   // 새로운 선을 넘지 못하게 시험하고 가로막는 감시자
  | '전령'          // 변화의 소식, 충격적 유혹, 사건을 알리는 메신저
  | '변신자'        // 아군인지 적인지 태도가 변하며 긴장감을 주는 인물
  | '그림자'        // 주인공의 억압된 어두운 욕망을 투영하거나 대립하는 적대자
  | '책략가';       // 규칙을 비틀고 판을 흔들며 도발하는 트릭스터

export interface SupportingCharacter {
  id: string;
  name: string;
  archetype: ArchetypeRole;
  role: string;
  relationship: string;
  notes: string;
  appearingParts: number[]; // 등장 부 목록 (예: [1], [2], [1, 2] 등)
}

export type Step1Section =
  | 'MALE_LEAD'                     // [남성주인공]
  | 'FEMALE_LEAD'                   // [여성주인공]
  | 'SUPPORTING_CAST'               // [보조인물]
  | 'STYLE_AND_TIME'                // [스타일] (문체, 사건시점, 사건연도, 작성시점/연도, 작성시제, 주요무대)
  | 'PARTS_STRUCTURE'               // [소설부구성] (1부~N부 관리)
  | 'META_BASIC';                   // [소설제목&태그&주요타겟독자층]

export interface Step1SectionUpdate {
  section: Step1Section;
  data: any;
}

export interface ModelConfig {
  modelName: 'gemini-2.5-flash';
  temperature: number;
  topP: number;
  thinkingBudget: number;
  maxOutputTokens: number;
  presetName?: 'creative' | 'balanced' | 'precise';
}

export interface NovelPart {
  partNumber: number;        // 1, 2, 3...
  title: string;             // 예: 1부 - 은밀한 계율, 2부 - 금기의 심연
  description: string;
  hiatusDuration?: string;   // n부와 n-1부 사이의 연재 간극/휴재 대기 기간 (예: '3개월', '6개월')
  partInstruction?: string;  // n부 전체 집필 지침
}

export interface WorldbuildingState {
  title: string;
  tags: string[];
  targetAudience: string;
  parts: NovelPart[];
  maleLead: {
    name: string;
    age: string;
    role: string;
    personality: string;
    appearance: string;
    speechStyle: string;
  };
  femaleLead: {
    name: string;
    age: string;
    role: string;
    personality: string;
    appearance: string;
    speechStyle: string;
  };
  supportingCharacters: SupportingCharacter[];
  toneStyle: string;
  mainSetting: string;
  eventPov: string;
  eventYear: string;
  writingYear: string;
  writingTense: string;
  primaryTropes: string[];
}

export interface EpisodeCard {
  id: string;
  part: number;
  stageNumber: number;
  subNumber: number;
  title: string;
  outline: string;
  keyConflict: string;
  climaxPoint: string;
}

export type VolumeLevel = '100%' | '125%' | '150%' | '175%' | '200%';
export type SensualLevel = '100%' | '125%' | '150%' | '175%' | '200%';

export interface ChapterDraft {
  episodeId: string;
  episodeTitle: string;
  volume: VolumeLevel;
  sensualIntensity: SensualLevel;
  content: string;
  lastUpdated: string;
  customInstruction?: string;
}

export type PlatformType = 'Theqoo' | 'ArcaLive' | 'Novelpia' | 'RidiBooks' | 'Acquaintance';

export interface CommenterPersona {
  id: string;
  name: string;
  platform: PlatformType;
  age: string;
  gender: string;
  personality: string;
  commentTone: string;
  avatarSeed: string;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  personaId: string;
  authorName: string;
  platform: PlatformType;
  content: string;
  upvotes: number;
  downvotes?: number;
  timestamp: string;
  rating?: number;
  isBest?: boolean;
  parentId?: string;         // ★ 대댓글의 상위 부모 댓글 ID (존재 시 댓댓글)
  replyToAuthor?: string;    // ★ 멘션/태그 대상 닉네임 (예: @새벽기도3년차_원덬)
}

export interface ChatProposedAction {
  type: string;
  payload: any;
  summaryTitle: string;
  details: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  appliedAction?: string;
  targetSections?: Step1Section[];
  proposedAction?: ChatProposedAction;
  isApplied?: boolean;
}

export interface NovelProjectState {
  version: string;
  savedAt: string;
  modelConfig: ModelConfig;
  worldbuilding: WorldbuildingState;
  episodes: EpisodeCard[];
  drafts: Record<string, ChapterDraft>;
  personas: CommenterPersona[];
  comments: EpisodeComment[];
}
