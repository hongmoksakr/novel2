import React, { useState } from 'react';
import { EpisodeCard } from '../types';
import { CAMPBELL_STAGES } from '../constants';
import { Plus, Trash2, Edit3, Compass, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface Step2Props {
  episodes: EpisodeCard[];
  onChangeEpisodes: (newEpisodes: EpisodeCard[]) => void;
  onNavigateToDraft: (episodeId: string) => void;
}

export const Step2Plotter: React.FC<Step2Props> = ({
  episodes,
  onChangeEpisodes,
  onNavigateToDraft,
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);

  // Form for new or edited episode
  const [formData, setFormData] = useState<Partial<EpisodeCard>>({
    title: '',
    outline: '',
    keyConflict: '',
    climaxPoint: '',
  });

  const stageEpisodes = episodes.filter((ep) => ep.stageNumber === selectedStage);

  const handleAddEpisode = (stageNum: number) => {
    const existingCount = episodes.filter((e) => e.stageNumber === stageNum).length;
    const newEp: EpisodeCard = {
      id: `ep-${Date.now()}`,
      stageNumber: stageNum,
      subNumber: existingCount + 1,
      title: `제${episodes.length + 1}화: [새 에피소드]`,
      outline: '이 에피소드의 주요 사건과 감정적 전개 개요를 입력하세요.',
      keyConflict: '두 인물 간의 대립 및 도덕적/성적 갈등 요인.',
      climaxPoint: '절정에 달하는 감정의 폭발 또는 은밀한 계기.',
    };

    onChangeEpisodes([...episodes, newEp]);
  };

  const handleDeleteEpisode = (id: string) => {
    if (confirm('해당 에피소드 플롯 카드를 삭제하시겠습니까?')) {
      onChangeEpisodes(episodes.filter((ep) => ep.id !== id));
      if (editingEpId === id) setEditingEpId(null);
    }
  };

  const handleStartEdit = (ep: EpisodeCard) => {
    setEditingEpId(ep.id);
    setFormData({
      title: ep.title,
      outline: ep.outline,
      keyConflict: ep.keyConflict,
      climaxPoint: ep.climaxPoint,
    });
  };

  const handleSaveEdit = (id: string) => {
    onChangeEpisodes(
      episodes.map((ep) => {
        if (ep.id === id) {
          return {
            ...ep,
            title: formData.title || ep.title,
            outline: formData.outline || ep.outline,
            keyConflict: formData.keyConflict || ep.keyConflict,
            climaxPoint: formData.climaxPoint || ep.climaxPoint,
          };
        }
        return ep;
      })
    );
    setEditingEpId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stage Header */}
      <div className="rounded-xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/40 to-zinc-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-600 text-white">
              Step 2
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              영웅의 여정 플롯터 (Hero's Journey 12 Stages)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            조셉 캠벨의 12단계 서사 구조를 기반으로 에피소드를 0~N개 동적으로 배치하여 완결성 있는 스토리를 설계합니다.
          </p>
        </div>

        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          총 등록된 에피소드: <span className="text-indigo-400 font-bold">{episodes.length}</span>편
        </div>
      </div>

      {/* 12 Stages Grid Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {CAMPBELL_STAGES.map((st) => {
          const count = episodes.filter((e) => e.stageNumber === st.stage).length;
          const isSelected = selectedStage === st.stage;

          return (
            <button
              key={st.stage}
              type="button"
              onClick={() => setSelectedStage(st.stage)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 shadow-md shadow-indigo-950/50'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-300' : 'text-zinc-400'}`}>
                  Stage {st.stage}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    count > 0 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}편
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 truncate">{st.title.split('. ')[1] || st.title}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail & Episodes List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        {/* Stage Overview Banner */}
        {(() => {
          const cur = CAMPBELL_STAGES.find((s) => s.stage === selectedStage);
          return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  {cur?.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{cur?.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAddEpisode(selectedStage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-900/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>이 단계에 서브 에피소드 추가</span>
              </button>
            </div>
          );
        })()}

        {/* Episode Cards */}
        {stageEpisodes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 mb-2">현재 단계에 구성된 에피소드가 없습니다.</p>
            <button
              type="button"
              onClick={() => handleAddEpisode(selectedStage)}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              + 첫 번째 에피소드 카드 생성하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stageEpisodes.map((ep, idx) => (
              <div
                key={ep.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700"
              >
                {editingEpId === ep.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">에피소드 제목</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">줄거리 및 상황 요약 (Outline)</label>
                      <textarea
                        rows={2}
                        value={formData.outline}
                        onChange={(e) => setFormData({ ...formData, outline: e.target.value })}
                        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">핵심 갈등 (Conflict)</label>
                        <input
                          type="text"
                          value={formData.keyConflict}
                          onChange={(e) => setFormData({ ...formData, keyConflict: e.target.value })}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">클라이맥스 포인트 (Climax)</label>
                        <input
                          type="text"
                          value={formData.climaxPoint}
                          onChange={(e) => setFormData({ ...formData, climaxPoint: e.target.value })}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingEpId(null)}
                        className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(ep.id)}
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
                      >
                        저장 완료
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                          Sub #{ep.subNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">{ep.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigateToDraft(ep.id)}
                          className="px-2.5 py-1 rounded text-[11px] bg-violet-600/30 text-violet-300 border border-violet-700/60 hover:bg-violet-600/50 transition-colors"
                        >
                          Step 3 집필로 이동 →
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(ep)}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEpisode(ep.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed mb-3">{ep.outline}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 font-medium">핵심 갈등: </span>
                        <span className="text-zinc-400">{ep.keyConflict}</span>
                      </div>
                      <div>
                        <span className="text-amber-500/80 font-medium">클라이맥스: </span>
                        <span className="text-zinc-400">{ep.climaxPoint}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
