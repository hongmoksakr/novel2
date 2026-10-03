import React, { useState, useRef, useEffect } from 'react';
import { WorldbuildingState, ChapterDraft, EpisodeCard } from '../types';
import { rewriteSelection } from '../services/geminiService';
import { Sparkles, Wand2, Check, RefreshCw, Flame, Heart, MessageSquare, Save, BookOpen, Clock, FileText } from 'lucide-react';

interface Step4Props {
  world: WorldbuildingState;
  episodes?: EpisodeCard[];
  drafts?: Record<string, ChapterDraft>;
  activeEpisodeId?: string;
  onSelectEpisode?: (epId: string) => void;
  activeDraft?: ChapterDraft;
  onUpdateContent: (newContent: string) => void;
  onSaveDraft?: (draft: ChapterDraft) => void;
}

export const Step4Editor: React.FC<Step4Props> = ({
  world,
  episodes = [],
  drafts = {},
  activeEpisodeId = 'ep-1',
  onSelectEpisode,
  activeDraft,
  onUpdateContent,
  onSaveDraft,
}) => {
  // 현재 활성화된 초안 결정 (props.activeDraft 우선, 없으면 drafts[activeEpisodeId])
  const currentEffectiveDraft = activeDraft || drafts[activeEpisodeId];

  // 로컬 편집 텍스트 상태
  const [content, setContent] = useState<string>(currentEffectiveDraft?.content || '');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);

  // activeDraft나 activeEpisodeId가 변경되었을 때 즉각 에디터에 본문 로드
  useEffect(() => {
    const draft = activeDraft || drafts[activeEpisodeId];
    setContent(draft?.content || '');
    setSelectedText('');
    setSelectionRange(null);
  }, [activeEpisodeId, activeDraft?.content, drafts[activeEpisodeId]?.content]);

  // ★ 사용자 요구사항: 텍스트 임의 수정 후 [저장] 버튼을 눌러 영구 저장
  const handleSaveTextChanges = () => {
    onUpdateContent(content);

    if (onSaveDraft && currentEffectiveDraft) {
      const updatedDraft: ChapterDraft = {
        ...currentEffectiveDraft,
        content: content,
        lastUpdated: new Date().toLocaleTimeString(),
      };
      onSaveDraft(updatedDraft);
    }

    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  const handleSelectText = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = content.slice(start, end);

    if (text.trim().length > 0) {
      setSelectedText(text);
      setSelectionRange({ start, end });
    }
  };

  const handleRewrite = async (instruction: string) => {
    if (!selectedText || !selectionRange) return;
    setIsRewriting(true);

    try {
      const rewritten = await rewriteSelection(content, selectedText, instruction, world);

      // Replace selection in content
      const before = content.slice(0, selectionRange.start);
      const after = content.slice(selectionRange.end);
      const updated = before + rewritten + after;

      setContent(updated);
      onUpdateContent(updated);
      setSelectedText('');
      setSelectionRange(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRewriting(false);
    }
  };

  const presetActions = [
    { label: '더 자극적으로', prompt: '신체적 접촉과 관능적 분위기를 훨씬 더 자극적이고 농밀하게 강화해줘', icon: Flame },
    { label: '감정 묘사 강화', prompt: '수치심과 배덕감, 도덕적 죄의식 속에서 흔들리는 심리를 극대화해줘', icon: Heart },
    { label: '대사 스타일 변경', prompt: '남주의 차갑고 명령조인 지배적 어투나 여주의 애원하는 대사로 다듬어줘', icon: MessageSquare },
    { label: '수위 높이기', prompt: '필터링 없이 거칠고 원초적인 수위로 묘사를 전환해줘', icon: Sparkles },
  ];

  const wordCount = content.length;
  const currentEpObj = episodes.find(e => e.id === activeEpisodeId) || episodes[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Intro Header with Episode Selector */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 4
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">AI 선택 영역 인라인 에디터 &amp; 본문 수정기</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Step 3에서 생성·저장된 본문을 불러와 <strong>자유롭게 직접 텍스트를 수정하고 [저장]</strong>하거나, 드래그 선택하여 AI 부분 재집필을 적용합니다.
          </p>
        </div>

        {/* 에피소드 선택기 */}
        {episodes.length > 0 && onSelectEpisode && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">편집 대상 에피소드:</label>
            <select
              value={activeEpisodeId}
              onChange={(e) => onSelectEpisode(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white font-medium focus:border-violet-500 focus:outline-none"
            >
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  [{ep.part || 1}부] {drafts[ep.id]?.episodeTitle || ep.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Floating Toolbar for Selected Text */}
      {selectedText && (
        <div className="rounded-xl border border-violet-500/60 bg-zinc-900 p-4 shadow-xl shadow-violet-950/40 animate-slide-down space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-violet-400" />
              선택된 구절 ({selectedText.length}자)
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedText('');
                setSelectionRange(null);
              }}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              선택 해제
            </button>
          </div>

          <blockquote className="rounded-lg bg-zinc-950 p-2.5 text-xs text-zinc-300 border-l-2 border-violet-500 italic">
            "{selectedText}"
          </blockquote>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {presetActions.map((act, i) => {
              const Icon = act.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRewrite(act.prompt)}
                  disabled={isRewriting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-violet-600 hover:border-violet-500 text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Instruction Bar */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (customPrompt.trim()) handleRewrite(customPrompt);
                }
              }}
              placeholder="선택 구절 수정 지시 입력 (예: 남주가 여주의 턱을 치켜올리며 차갑게 속삭이는 장면으로 수정)..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => customPrompt.trim() && handleRewrite(customPrompt)}
              disabled={!customPrompt.trim() || isRewriting}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            >
              적용하기
            </button>
          </div>

          {isRewriting && (
            <div className="flex items-center gap-2 text-xs text-violet-300 animate-pulse pt-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI가 선택한 문맥을 분석하여 정밀 재집필하고 있습니다...</span>
            </div>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
        {/* 상단 툴바: 챕터 제목 및 글자수, [저장] 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-300 font-bold">
              [{currentEpObj?.part || 1}부] {currentEffectiveDraft?.episodeTitle || currentEpObj?.title || '에피소드 본문'}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">({wordCount.toLocaleString()}자)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* ★ 사용자 요구사항: Step4에서 텍스트 임의 수정 후 [저장] 버튼 */}
            <button
              type="button"
              onClick={handleSaveTextChanges}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/40"
              title="Step4에서 수정한 본문 내용을 영구 저장합니다"
            >
              {saveSuccessToast ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5 text-white" />}
              <span>{saveSuccessToast ? '수정 내용 저장 완료!' : '수정 내용 본문 저장'}</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between">
          <span>💡 본문을 자유롭게 직접 타이핑 수정할 수 있으며, 문장을 마우스로 드래그하면 AI 부분 수정 툴바가 활성화됩니다.</span>
          <span className="text-zinc-500">&lt;imagination&gt; 상상 &nbsp;|&nbsp; &lt;reminiscence&gt; 과거 회상</span>
        </div>

        <textarea
          ref={textareaRef}
          rows={18}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onUpdateContent(e.target.value);
          }}
          onSelect={handleSelectText}
          onMouseUp={handleSelectText}
          placeholder="Step 3에서 본문을 생성하거나, 여기에 직접 소설을 작성하세요..."
          className="w-full bg-transparent border-0 text-sm text-zinc-200 leading-relaxed font-serif focus:outline-none resize-y selection:bg-violet-600 selection:text-white"
        />
      </div>
    </div>
  );
};
