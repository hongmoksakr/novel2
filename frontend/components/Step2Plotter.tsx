import React, { useState } from 'react';
import { EpisodeCard, NovelPart } from '../types';
import { CAMPBELL_16_STAGES } from '../constants';
import { Plus, Trash2, Edit3, Compass, Layers, Check, X } from 'lucide-react';

interface Step2Props {
  episodes: EpisodeCard[];
  parts?: NovelPart[];
  onChangeEpisodes: (newEpisodes: EpisodeCard[]) => void;
  onNavigateToDraft: (episodeId: string) => void;
}

export const Step2Plotter: React.FC<Step2Props> = ({
  episodes,
  parts = [{ partNumber: 1, title: '1부', description: '' }],
  onChangeEpisodes,
  onNavigateToDraft,
}) => {
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);

  // ★ 인라인 에피소드 삭제 확인 상태 (샌드박스 confirm() 무시 현상 완전 해결)
  const [deletingEpisodeId, setDeletingEpisodeId] = useState<string | null>(null);

  // Form for new or edited episode
  const [formData, setFormData] = useState<Partial<EpisodeCard>>({
    title: '',
    outline: '',
    keyConflict: '',
    climaxPoint: '',
  });

  // 현재 선택된 부(Part)와 단계(Stage)에 속한 에피소드 필터링
  const partEpisodes = episodes.filter((ep) => (ep.part || 1) === selectedPart);
  const stageEpisodes = partEpisodes.filter((ep) => ep.stageNumber === selectedStage);

  const handleAddEpisode = (stageNum: number) => {
    const existingCount = stageEpisodes.length;
    const newEp: EpisodeCard = {
      id: `ep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      part: selectedPart,
      stageNumber: stageNum,
      subNumber: existingCount + 1,
      title: `${selectedPart}부 Stage ${stageNum} - 에피소드 #${existingCount + 1}`,
      outline: '이 에피소드의 주요 사건과 감정적 전개 개요를 입력하세요.',
      keyConflict: '두 인물 간의 대립 및 도덕적/성적 갈등 요인.',
      climaxPoint: '절정에 달하는 감정의 폭발 또는 은밀한 계기.',
    };

    onChangeEpisodes([...episodes, newEp]);
  };

  // ★ 인라인 삭제 실행 함수 (100% 안정적 동작)
  const handleExecuteDeleteEpisode = (targetId: string) => {
    const remaining = episodes.filter((ep) => ep.id !== targetId);
    onChangeEpisodes(remaining);
    setDeletingEpisodeId(null);
    if (editingEpId === targetId) {
      setEditingEpId(null);
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Stage Header */}
      <div className="rounded-xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/40 to-zinc-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-600 text-white">
              Step 2
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              영웅의 여정 플롯터 (1부~N부 × Stage 1~16)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            소설의 각 부(Part)별로 <strong>Stage 1부터 Stage 16까지</strong> 완결성 있는 에피소드 아크를 자유롭게 구성합니다.
          </p>
        </div>

        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          총 에피소드: <span className="text-indigo-400 font-bold">{episodes.length}</span>편 (현재 {selectedPart}부: <span className="text-white font-bold">{partEpisodes.length}</span>편)
        </div>
      </div>

      {/* 부(Part) 전환 탭 바 */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mr-2 shrink-0">
          <Layers className="w-4 h-4 text-indigo-400" /> 부(Part) 선택:
        </span>
        {parts.map((p) => (
          <button
            key={p.partNumber}
            type="button"
            onClick={() => {
              setSelectedPart(p.partNumber);
              setSelectedStage(1);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedPart === p.partNumber
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {p.partNumber}부: {p.title || `제${p.partNumber}부`}
          </button>
        ))}
      </div>

      {/* Stage 1 to 16 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CAMPBELL_16_STAGES.map((st) => {
          const count = partEpisodes.filter((e) => e.stageNumber === st.stage).length;
          const isSelected = selectedStage === st.stage;

          return (
            <button
              key={st.stage}
              type="button"
              onClick={() => setSelectedStage(st.stage)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/60 shadow-md shadow-indigo-950/50'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-300' : 'text-zinc-400'}`}>
                  Stage {st.stage}
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                    count > 0 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-200 truncate">{st.title.split('. ')[1] || st.title}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail & Episodes List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        {(() => {
          const cur = CAMPBELL_16_STAGES.find((s) => s.stage === selectedStage);
          return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  [{selectedPart}부] Stage {selectedStage}. {cur?.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{cur?.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAddEpisode(selectedStage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-900/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>이 단계에 에피소드 추가</span>
              </button>
            </div>
          );
        })()}

        {/* Episode Cards */}
        {stageEpisodes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 mb-2">현재 {selectedPart}부 Stage {selectedStage}에 등록된 에피소드가 없습니다.</p>
            <button
              type="button"
              onClick={() => handleAddEpisode(selectedStage)}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              + 첫 번째 에피소드 생성하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stageEpisodes.map((ep) => {
              const isConfirmingDelete = deletingEpisodeId === ep.id;

              return (
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
                          className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(ep.id)}
                          className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 cursor-pointer"
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
                            {ep.part || 1}부 · Sub #{ep.subNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white">{ep.title}</h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigateToDraft(ep.id)}
                            className="px-2.5 py-1 rounded text-[11px] bg-violet-600/30 text-violet-300 border border-violet-700/60 hover:bg-violet-600/50 transition-colors cursor-pointer"
                          >
                            Step 3 집필로 이동 →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(ep)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* ★ 100% 동작하는 인라인 삭제 버튼 */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-950/80 p-0.5 rounded border border-red-700">
                              <button
                                type="button"
                                onClick={() => handleExecuteDeleteEpisode(ep.id)}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                              >
                                삭제 확정
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingEpisodeId(null)}
                                className="p-0.5 rounded text-zinc-400 hover:text-white"
                                title="취소"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingEpisodeId(ep.id)}
                              className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 cursor-pointer transition-colors"
                              title="에피소드 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
