import React, { useState } from 'react';
import { NovelSettings, Episode } from '../types';
import { 
  Sparkles, Wand2, ArrowRight, ArrowLeft, Check, 
  RotateCcw, SlidersHorizontal, Quote, ArrowDown, BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { refineTextSelectionAI } from '../services/geminiService';

interface Step4RefineProps {
  settings: NovelSettings;
  episodes: Episode[];
  onChangeEpisodes: (episodes: Episode[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4Refine: React.FC<Step4RefineProps> = ({
  settings,
  episodes,
  onChangeEpisodes,
  onNext,
  onPrev,
}) => {
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>('1단계 기획(사제지간, 연상연하, 종교적 죄책감과 메조히즘)을 준수하여 더 서늘하고 긴박한 텐션으로 수정해줘.');
  const [refinedResult, setRefinedResult] = useState<string>('');
  const [isRefining, setIsRefining] = useState(false);

  const activeEpisode = episodes.find(e => e.id === selectedEpId) || episodes[0];

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== end) {
      const text = target.value.substring(start, end);
      setSelectedText(text);
      setSelectionRange({ start, end });
    }
  };

  const handleRefine = async () => {
    if (!selectedText.trim()) {
      alert('본문에서 수정하고 싶은 문장이나 단락을 마우스로 드래그하여 선택해주세요.');
      return;
    }
    setIsRefining(true);
    try {
      const polished = await refineTextSelectionAI(
        selectedText,
        customInstruction,
        settings,
        activeEpisode ? { title: activeEpisode.title, stageTitle: activeEpisode.stageTitle } : undefined
      );
      setRefinedResult(polished);
    } catch (err) {
      alert('AI 퇴고 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleApplyPolishedText = () => {
    if (!activeEpisode || !selectionRange || !refinedResult) return;
    const original = activeEpisode.content;
    const newContent =
      original.substring(0, selectionRange.start) +
      refinedResult +
      original.substring(selectionRange.end);

    onChangeEpisodes(
      episodes.map(e => e.id === activeEpisode.id ? { ...e, content: newContent } : e)
    );
    setSelectedText('');
    setRefinedResult('');
    setSelectionRange(null);
  };

  const quickPresets = [
    '1단계 남주인공의 냉정한 명령조와 통제력을 강조하여 수정',
    '1단계 여주인공의 떨리는 내면 메조히스틱 호흡과 죄책감 부각',
    '개신교회 성가대실/기도실의 서늘한 정적과 배덕감 극대화',
    '1단계 지정 문체(간결한 호흡, 밀착 감각 묘사)로 문장 리듬 다듬기'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 rounded-2xl border border-purple-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                4단계
              </span>
              <h1 className="text-xl font-bold text-white">AI 부분 문장 퇴고 & 윤문</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              본문에서 아쉬운 문단이나 대사를 드래그하여 선택한 후, <strong className="text-purple-300">1단계 기획(시점, 시제, 문체, 인물관계)</strong>을 엄격히 반영하여 리라이팅합니다.
            </p>
          </div>

          <div className="flex gap-2">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEpId(ep.id);
                  setSelectedText('');
                  setRefinedResult('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  activeEpisode?.id === ep.id
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                제{idx + 1}화
              </button>
            ))}
          </div>
        </div>

        {/* 1st Step Compliance Status Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-300">
          <span className="flex items-center gap-1 text-purple-400 font-bold shrink-0">
            <BookmarkCheck className="w-3.5 h-3.5" />
            1단계 준수 규칙:
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            시점: <strong className="text-white">{settings.storyPov}</strong>
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            시제: <strong className="text-white">{settings.narrativeTense}</strong>
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300 line-clamp-1 max-w-[260px]">
            문체: {settings.writingStyle}
          </span>
        </div>
      </div>

      {activeEpisode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Original Text with Drag Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{activeEpisode.title} 원문</span>
              <span className="text-purple-400 font-medium">💡 마우스로 원하는 구절을 드래그하여 선택하세요</span>
            </div>

            <textarea
              rows={22}
              value={activeEpisode.content}
              onSelect={handleTextareaSelect}
              onChange={(e) => {
                const val = e.target.value;
                onChangeEpisodes(
                  episodes.map(ep => ep.id === activeEpisode.id ? { ...ep, content: val } : ep)
                );
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm leading-relaxed font-serif text-slate-200 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>

          {/* Right: AI Selection Refinement Workbench */}
          <div className="space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>선택 부분 AI 리라이팅 워크벤치</span>
            </h3>

            {/* Selected Text Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Quote className="w-3 h-3 text-purple-400" />
                  선택된 원문 구간
                </label>
                {selectedText && (
                  <span className="text-[10px] text-purple-400 font-mono">
                    {selectedText.length}글자 선택됨
                  </span>
                )}
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 min-h-[75px] max-h-[140px] overflow-y-auto font-serif leading-relaxed italic">
                {selectedText ? selectedText : '원문 텍스트에서 수정하고 싶은 구절을 드래그하여 선택하세요.'}
              </div>
            </div>

            {/* Instruction presets */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                1단계 준수 빠른 요청 프리셋
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomInstruction(preset)}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">상세 수정 요청 지시문</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="예: 1단계 남주인공의 차가운 존댓말 지배력을 살려 수정해줘"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleRefine}
                  disabled={!selectedText.trim() || isRefining}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                  <span>{isRefining ? '퇴고 중...' : 'AI 퇴고'}</span>
                </button>
              </div>
            </div>

            {/* Refined Output Result */}
            {refinedResult && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    AI 수정 제안안 (1단계 기획 명세 반영 완료)
                  </span>
                  <button
                    onClick={handleApplyPolishedText}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>선택 원문에 즉시 교체 반영</span>
                  </button>
                </div>
                <div className="bg-slate-950/90 p-3.5 rounded-lg border border-purple-500/20 text-xs text-slate-100 leading-loose font-serif whitespace-pre-wrap">
                  {refinedResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
        >
          이전: 3단계 본문 집필
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <span>5단계: 댓글러 페르소나 및 정주행 댓글 생성</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
