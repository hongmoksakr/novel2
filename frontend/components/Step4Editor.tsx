import React, { useState, useRef } from 'react';
import { WorldbuildingState, ChapterDraft } from '../types';
import { rewriteSelection } from '../services/geminiService';
import { Sparkles, Wand2, Check, RefreshCw, Undo2, Flame, Heart, MessageSquare } from 'lucide-react';

interface Step4Props {
  world: WorldbuildingState;
  activeDraft?: ChapterDraft;
  onUpdateContent: (newContent: string) => void;
}

export const Step4Editor: React.FC<Step4Props> = ({
  world,
  activeDraft,
  onUpdateContent,
}) => {
  const content = activeDraft?.content || '';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [lastRewritten, setLastRewritten] = useState<string | null>(null);

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
      setLastRewritten(rewritten);

      // Replace selection in content
      const before = content.slice(0, selectionRange.start);
      const after = content.slice(selectionRange.end);
      const updated = before + rewritten + after;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
            Step 4
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">AI 선택 영역 인라인 에디터 (Selection Editor)</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          수정하고 싶은 문장을 마우스로 드래그(선택)한 뒤, 프리셋 버튼이나 맞춤 지시어를 입력하여 문맥에 맞춰 정밀 재집필합니다.
        </p>
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
              className="text-xs text-zinc-400 hover:text-white"
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
              placeholder="직접 지시 입력 (예: 남주가 여주의 턱을 쥐며 속삭이는 장면으로 수정)..."
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
              <span>AI가 해당 문장을 정밀 수정하여 본문에 교체 반영하고 있습니다...</span>
            </div>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <span className="text-xs text-zinc-400">
            현재 챕터: <strong className="text-zinc-200">{activeDraft?.episodeTitle || '선택된 에피소드 없음'}</strong>
          </span>
          <span className="text-[11px] text-zinc-500">
            문장을 마우스로 드래그하면 AI 수정 툴바가 활성화됩니다.
          </span>
        </div>

        <textarea
          ref={textareaRef}
          rows={18}
          value={content}
          onChange={(e) => onUpdateContent(e.target.value)}
          onSelect={handleSelectText}
          onMouseUp={handleSelectText}
          placeholder="Step 3에서 본문을 생성하거나, 여기에 직접 소설을 작성하세요..."
          className="w-full bg-transparent border-0 text-sm text-zinc-200 leading-relaxed font-serif focus:outline-none resize-y selection:bg-violet-600 selection:text-white"
        />
      </div>
    </div>
  );
};
