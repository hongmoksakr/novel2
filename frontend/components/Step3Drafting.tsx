import React, { useState } from 'react';
import { WorldbuildingState, EpisodeCard, ChapterDraft, VolumeLevel, SensualLevel } from '../types';
import { generateChapterDraft } from '../services/geminiService';
import { Sparkles, Sliders, Play, Save, Flame, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface Step3Props {
  world: WorldbuildingState;
  episodes: EpisodeCard[];
  drafts: Record<string, ChapterDraft>;
  activeEpisodeId: string;
  onSelectEpisode: (epId: string) => void;
  onSaveDraft: (draft: ChapterDraft) => void;
  onNavigateToEditor: () => void;
}

export const Step3Drafting: React.FC<Step3Props> = ({
  world,
  episodes,
  drafts,
  activeEpisodeId,
  onSelectEpisode,
  onSaveDraft,
  onNavigateToEditor,
}) => {
  const currentEp = episodes.find((e) => e.id === activeEpisodeId) || episodes[0];

  const currentDraft = currentEp ? drafts[currentEp.id] : undefined;

  const [volume, setVolume] = useState<VolumeLevel>(currentDraft?.volume || '100%');
  const [sensual, setSensual] = useState<SensualLevel>(currentDraft?.sensualIntensity || '150%');
  const [content, setContent] = useState<string>(currentDraft?.content || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync content when active episode switches
  React.useEffect(() => {
    if (currentEp) {
      const draft = drafts[currentEp.id];
      if (draft) {
        setContent(draft.content);
        setVolume(draft.volume);
        setSensual(draft.sensualIntensity);
      } else {
        setContent('');
      }
    }
  }, [activeEpisodeId, drafts]);

  const handleGenerate = async () => {
    if (!currentEp) return;
    setIsGenerating(true);

    try {
      const generated = await generateChapterDraft(world, currentEp, volume, sensual);
      setContent(generated);

      const newDraft: ChapterDraft = {
        episodeId: currentEp.id,
        episodeTitle: currentEp.title,
        volume,
        sensualIntensity: sensual,
        content: generated,
        lastUpdated: new Date().toLocaleTimeString(),
      };
      onSaveDraft(newDraft);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = () => {
    if (!currentEp) return;
    const newDraft: ChapterDraft = {
      episodeId: currentEp.id,
      episodeTitle: currentEp.title,
      volume,
      sensualIntensity: sensual,
      content,
      lastUpdated: new Date().toLocaleTimeString(),
    };
    onSaveDraft(newDraft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const volumeOptions: { level: VolumeLevel; label: string; desc: string }[] = [
    { level: '100%', label: '100% (기본)', desc: '공백 포함 약 2,000자 내외' },
    { level: '125%', label: '125% (확장)', desc: '공백 포함 약 3,500자' },
    { level: '150%', label: '150% (상세)', desc: '공백 포함 약 5,000자' },
    { level: '175%', label: '175% (장대함)', desc: '공백 포함 약 6,500자' },
    { level: '200%', label: '200% (극대화)', desc: '공백 포함 약 8,000자 이상' },
  ];

  const sensualOptions: { level: SensualLevel; label: string; desc: string }[] = [
    { level: '100%', label: '100% (기본)', desc: '은밀한 텐션과 심리적 긴장' },
    { level: '125%', label: '125% (고조)', desc: '노골적 스킨십과 은밀한 복종' },
    { level: '150%', label: '150% (자극적)', desc: '수치심과 쾌락의 교차, 훈육 묘사' },
    { level: '175%', label: '175% (수위 높음)', desc: '적나라하고 관능적인 배덕감 극대화' },
    { level: '200%', label: '200% (극도의 음탕함/천박함)', desc: '원초적 농락과 피학적 쾌락의 날것 묘사' },
  ];

  const wordCount = content.length;
  const estimatedReadTime = Math.ceil(wordCount / 500);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-fuchsia-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 3
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              본문 집필 및 정밀 수위/분량 조절기
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            선택한 에피소드의 플롯을 기반으로 5단계 분량과 5단계 수위/음탕·천박 서술 조절기를 적용하여 텍스트를 완성합니다.
          </p>
        </div>

        {/* Episode Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">대상 에피소드:</label>
          <select
            value={currentEp?.id}
            onChange={(e) => onSelectEpisode(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white font-medium focus:border-violet-500 focus:outline-none"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Levers Grid (Volume & Sensual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Volume Ratio Selector */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              1. 분량 조절기 (Volume Ratio - 5단계)
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded">
              {volume}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {volumeOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setVolume(opt.level)}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  volume === opt.level
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {opt.level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400">
            {volumeOptions.find((o) => o.level === volume)?.desc}
          </p>
        </div>

        {/* Sensual Intensity Selector */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
              2. 수위 / 음탕·천박 서술 조절기 (5단계)
            </span>
            <span className="text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-950/80 px-2 py-0.5 rounded">
              {sensual}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {sensualOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setSensual(opt.level)}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  sensual === opt.level
                    ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {opt.level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-fuchsia-300">
            {sensualOptions.find((o) => o.level === sensual)?.desc}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            글자수: <strong className="text-white ml-0.5">{wordCount.toLocaleString()}</strong>자
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            예상 독서시간: <strong className="text-white ml-0.5">{estimatedReadTime}</strong>분
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {justSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{justSaved ? '저장됨' : '본문 임시저장'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Gemini 2.5 집필 진행 중...' : '본문 AI 생성하기'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
          <span className="text-xs font-semibold text-zinc-300">
            [에피소드 본문]: {currentEp?.title}
          </span>
          <button
            type="button"
            onClick={onNavigateToEditor}
            className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
          >
            선택 영역 AI 부분 수정 (Step 4로 이동) →
          </button>
        </div>

        <textarea
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="본문 AI 생성하기 버튼을 누르거나, 직접 작성하세요..."
          className="w-full bg-transparent border-0 text-sm text-zinc-200 leading-relaxed font-serif placeholder-zinc-700 focus:outline-none resize-y"
        />
      </div>
    </div>
  );
};
