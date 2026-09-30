export interface WorldbuildingState {
  title: string;
  tags: string[];
  maleLead: {
    name: string;
    age: string;
    role: string;
    personality: string;
    appearance: string;
    hiddenTrait: string;
  };
  femaleLead: {
    name: string;
    age: string;
    role: string;
    personality: string;
    appearance: string;
    secretDesire: string;
  };
  supportingCast: string;
  toneStyle: string;
  pov: string;
  tense: string;
  targetAudience: string;
  primaryTropes: string[];
}

export interface EpisodeCard {
  id: string;
  stageNumber: number; // 1 to 12
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
}

export type PlatformType = 'Theqoo' | 'ArcaLive' | 'Novelpia' | 'RidiBooks';

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
  rating?: number; // 1-5 for Ridi
  isBest?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  appliedAction?: string;
}

export interface NovelProjectState {
  version: string;
  savedAt: string;
  worldbuilding: WorldbuildingState;
  episodes: EpisodeCard[];
  drafts: Record<string, ChapterDraft>;
  personas: CommenterPersona[];
  comments: EpisodeComment[];
}
