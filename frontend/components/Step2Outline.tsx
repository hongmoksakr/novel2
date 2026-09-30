import React, { useState } from 'react';
import { NovelSettings, Episode, HeroStageTemplate } from '../types';
import { HERO_JOURNEY_STAGES } from '../constants';
import { 
  GitBranch, Plus, Trash2, Wand2, ArrowRight, ChevronDown, 
  ChevronUp, GripVertical, Sparkles, BookOpen 
} from 'lucide-react';
import { generateStageEpisodesAI } from '../services/geminiService';

interface Step2OutlineProps {
  settings: NovelSettings;
  episodes: Episode[];
  onChangeEpisodes: (episodes: Episode[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Outline: React.FC<Step2OutlineProps> = ({
  settings,
  episodes,
  onChangeEpisodes,
  onNext,
  onPrev,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [loadingStageId, setLoadingStageId] = useState<number | null>(null);

  // Group episodes by stage
  const getStageEpisodes = (stageId: number) => {
    return episodes.filter(ep => ep.stageId === stageId);
  };

  const handleAddEpisode = (stage: HeroStageTemplate) => {
    const stageEps = getStageEpisodes(stage.stageId);
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      stageId: stage.stageId,
      stageTitle: stage.name,
      epNumber: episodes.length + 1,
      title: `제${episodes.length + 1}화. ${stage.name.split('.')[1]?.trim() || '새로운 전개'} (${stageEps.length + 1})`,
      summary: `${stage.defaultEpisodeHint}에 관한 구체적 사건과 심리 묘사`,
      keyEvents: ['새로운 상황 마주함', '주인공의 독특한 대처', '다음 화로 이어지는 긴장감'],
      conflict: '예기치 못한 암초와 의견 대립',
      content: ''
    };
    onChangeEpisodes([...episodes, newEp]);
  };

  const handleDeleteEpisode = (id: string) => {
    onChangeEpisodes(episodes.filter(ep => ep.id !== id));
  };

  const handleUpdateEpisode = (id: string, field: keyof Episode, value: any) => {
    onChangeEpisodes(
      episodes.map(ep => ep.id === id ? { ...ep, [field]: value } : ep)
    );
  };

  const handleAiAutoPopulateStage = async (stage: HeroStageTemplate) => {
    setLoadingStageId(stage.stageId);
    try {
      const generated = await generateStageEpisodesAI(
        stage.stageId,
        stage.name,
        stage.description,
        settings,
        episodes.length,
        2
      );

      const newEpisodes: Episode[] = generated.map((gen, idx) => ({
        id: `ep-${Date.now()}-${idx}`,
        stageId: stage.stageId,
        stageTitle: stage.name,
        epNumber: episodes.length + idx + 1,
        title: gen.title,
        summary: gen.summary,
        keyEvents: gen.keyEvents,
        conflict: gen.conflict,
        content: ''
      }));

      onChangeEpisodes([...episodes, ...newEpisodes]);
    } catch (err) {
      alert('에피소드 자동 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingStageId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                2단계
              </span>
              <h1 className="text-xl font-bold text-white">[영웅의 여정 12단계] 에피소드 얼개 설계</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              조지프 캠벨의 신화적 서사 [영웅의 여정 12단계]에 기반하여 자유롭게 에피소드를 증감하고 배치하세요.
              (특정 단계에 1개 혹은 5개 이상의 에피소드를 유연하게 구성할 수 있습니다.)
            </p>
          </div>
          <div className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            총 기획 에피소드: <span className="text-emerald-400 font-bold">{episodes.length}개</span>
          </div>
        </div>
      </div>

      {/* Stage Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {HERO_JOURNEY_STAGES.map((st) => {
          const count = getStageEpisodes(st.stageId).length;
          const isSelected = selectedStageId === st.stageId;
          return (
            <button
              key={st.stageId}
              onClick={() => setSelectedStageId(st.stageId)}
              className={`p-2.5 rounded-xl text-left border transition relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold block text-emerald-400">STAGE {st.stageId}</span>
                <span className="text-xs font-medium line-clamp-1">{st.name.replace(/^\d+\.\s*/, '')}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{st.englishName.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.2 rounded-full font-bold ${count > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  {count}화
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail & Episode Manager */}
      {(() => {
        const currentStage = HERO_JOURNEY_STAGES.find(s => s.stageId === selectedStageId)!;
        const stageEps = getStageEpisodes(selectedStageId);

        return (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
            {/* Stage Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentStage.name}</h2>
                  <span className="text-xs text-slate-400 font-mono">({currentStage.englishName})</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentStage.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAiAutoPopulateStage(currentStage)}
                  disabled={loadingStageId === currentStage.stageId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${loadingStageId === currentStage.stageId ? 'animate-spin' : ''}`} />
                  <span>{loadingStageId === currentStage.stageId ? 'AI 플롯 생성 중...' : 'AI 에피소드 추천 생성 (+2화)'}</span>
                </button>
                <button
                  onClick={() => handleAddEpisode(currentStage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>에피소드 수동 추가</span>
                </button>
              </div>
            </div>

            {/* Episode Cards in this stage */}
            {stageEps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <p className="text-sm text-slate-400 mb-2">현재 이 단계에 등록된 에피소드가 없습니다.</p>
                <p className="text-xs text-slate-500 mb-4">AI 추천 생성을 누르거나 수동으로 새 에피소드를 추가해보세요.</p>
                <button
                  onClick={() => handleAddEpisode(currentStage)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition"
                >
                  이 단계에 1개 에피소드 추가
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {stageEps.map((ep, idx) => (
                  <div
                    key={ep.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          EP #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ep.title}
                          onChange={(e) => handleUpdateEpisode(ep.id, 'title', e.target.value)}
                          className="flex-1 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none text-sm font-bold text-white px-1 py-0.5"
                          placeholder="에피소드 제목"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition"
                        title="에피소드 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">에피소드 핵심 줄거리</label>
                        <textarea
                          rows={2}
                          value={ep.summary}
                          onChange={(e) => handleUpdateEpisode(ep.id, 'summary', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">주요 갈등 & 클리프행어</label>
                        <textarea
                          rows={2}
                          value={ep.conflict}
                          onChange={(e) => handleUpdateEpisode(ep.id, 'conflict', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">주요 사건 전개 (쉼표로 구분)</label>
                      <input
                        type="text"
                        value={ep.keyEvents.join(', ')}
                        onChange={(e) => handleUpdateEpisode(ep.id, 'keyEvents', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
        >
          이전: 1단계 설정 수정
        </button>
        <button
          onClick={onNext}
          disabled={episodes.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg transition"
        >
          <span>3단계: 본문 집필하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
