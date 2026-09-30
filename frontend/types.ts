export interface NovelSettings {
  title: string;
  tags: string[];
  genre: string;
  maleLead: string;
  femaleLead: string;
  supportingChars: string;
  writingStyle: string; // 문체
  storyPov: string; // 사건 시점
  narrativeTense: string; // 작성 시점
  targetAudience: string; // 타깃 독자층
  synopsis: string;
}

export interface Episode {
  id: string;
  stageId: number; // 1 ~ 12 (영웅의 여정)
  stageTitle: string;
  epNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  conflict: string;
  content: string; // 집필된 원문 (Step 3)
}

export interface HeroStageTemplate {
  stageId: number;
  name: string;
  englishName: string;
  description: string;
  defaultEpisodeHint: string;
}

export type PlatformStyle = '더쿠' | '아카라이브' | '노벨피아' | '리디북스' | '디시인사이드' | '조아라';

export interface CommenterPersona {
  id: string;
  name: string;
  platform: PlatformStyle;
  age: string;
  gender: string;
  personality: string;
  toneStyle: string;
  favoriteGenre: string;
  avatarColor: string;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  personaId: string;
  personaName: string;
  platform: PlatformStyle;
  content: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  reactionTag?: string;
}

export type ActionType = 
  | 'update_settings'      // 1단계 설정 반영
  | 'add_episode'          // 2단계 에피소드 추가
  | 'update_episode'        // 2단계 에피소드 수정
  | 'replace_content'      // 3단계 본문 교체
  | 'append_content'       // 3단계 본문 이어쓰기
  | 'add_persona'          // 5단계 페르소나 추가
  | 'add_comment';         // 5단계 댓글 추가

export interface ActionProposal {
  id: string;
  targetStep: number;
  type: ActionType;
  label: string;
  summary: string;
  payload: any;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  proposal?: ActionProposal;
}

export interface ProjectFullData {
  version: string;
  exportedAt: string;
  settings: NovelSettings;
  episodes: Episode[];
  personas: CommenterPersona[];
  comments: EpisodeComment[];
}
