import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Tag, Sliders, ChevronDown, ChevronUp, Cpu, ArrowRight, Zap, Check, Flame, Gauge, ShieldCheck, Hash, UserCheck, Heart, Users, Palette, BookText } from 'lucide-react';
import { ChatMessage, NovelProjectState, Step1Section, ModelConfig, ChatProposedAction } from '../types';
import { askAiCopilot } from '../services/geminiService';

interface AiChatPanelProps {
  projectState: NovelProjectState;
  activeStep: number;
  onStateAction: (actionType: string, payload: any) => void;
  onSelectStep: (stepNumber: number) => void;
  lastUpdatedSections?: Step1Section[];
  onUpdateModelConfig?: (config: ModelConfig) => void;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  projectState,
  activeStep,
  onStateAction,
  onSelectStep,
  onUpdateModelConfig,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `반갑습니다, 작가님! K-웹소설 전용 AI Co-pilot입니다.
채팅으로 원하시는 캐릭터 설정(남성주인공, 여성주인공, 보조인물, 스타일 등)을 말씀해 주시면, 바로 대시보드를 덮어쓰지 않고 변경 내용을 정리한 **[반영하기]** 버튼 카드를 생성해 드립니다. 카드의 버튼을 클릭하시면 우측 대시보드에 정확하게 반영됩니다.

💡 태그 사용 팁:
• [남성주인공] 이름은 최창환, 24세 신학생 전도사. 평소엔 깍듯한 존댓말이지만 단둘이 있을 땐 나직하게 명령하는 차가운 지배자 말투로 채워줘
• [여성주인공] 32세 청순한 고등학교 교사 손세미. 평소엔 단아하지만 창환의 훈육 앞에서는 수치심에 떨며 애원하는 복종조 말투로 채워줘
• [보조인물] 문턱 수호자 원형으로 둘을 감시하는 청년부원 한 명 추가해줘
• [스타일] 주요 무대를 개신교회 성가대실과 사택으로 지정하고 2019년 과거형으로 설정해줘`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [modelConfig, setModelConfig] = useState<ModelConfig>(
    projectState.modelConfig || {
      modelName: 'gemini-2.5-flash',
      temperature: 0.85,
      topP: 0.95,
      thinkingBudget: 0,
      maxOutputTokens: 3500,
      presetName: 'creative'
    }
  );

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askAiCopilot(textToSend, {
        world: projectState.worldbuilding,
        episodes: projectState.episodes,
        currentStep: activeStep,
        modelConfig,
      });

      // ★ 즉시 자동 반영하지 않고, 사용자가 직접 [반영하기] 버튼을 누를 때까지 대기
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetSections: response.targetedSections,
        proposedAction: response.proposedAction,
        isApplied: false, // 대기 상태
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Co-pilot send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'assistant',
          text: '요청 사항을 접수했습니다. 우측 대시보드 탭에서 직접 확인해 주세요.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ★ 사용자가 카드의 [반영하기] 버튼을 클릭했을 때만 실제 대시보드 state에 동기화
  const handleApplyAction = (msgId: string, action: ChatProposedAction) => {
    onStateAction(action.type, action.payload);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isApplied: true } : m))
    );
  };

  const insertTag = (tagStr: string) => {
    if (inputQuery.includes(tagStr)) return;
    setInputQuery((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${tagStr} ${trimmed}` : `${tagStr} `;
    });
    inputRef.current?.focus();
  };

  const applyModelPreset = (preset: 'creative' | 'balanced' | 'precise') => {
    let newConfig: ModelConfig;
    if (preset === 'creative') {
      newConfig = { ...modelConfig, temperature: 0.95, topP: 0.95, maxOutputTokens: 4500, presetName: 'creative' };
    } else if (preset === 'balanced') {
      newConfig = { ...modelConfig, temperature: 0.75, topP: 0.9, maxOutputTokens: 3500, presetName: 'balanced' };
    } else {
      newConfig = { ...modelConfig, temperature: 0.4, topP: 0.8, maxOutputTokens: 2500, presetName: 'precise' };
    }
    setModelConfig(newConfig);
    if (onUpdateModelConfig) onUpdateModelConfig(newConfig);
  };

  const sectionTags = [
    { label: '[남성주인공]', color: 'hover:border-indigo-500 hover:text-indigo-300' },
    { label: '[여성주인공]', color: 'hover:border-fuchsia-500 hover:text-fuchsia-300' },
    { label: '[보조인물]', color: 'hover:border-emerald-500 hover:text-emerald-300' },
    { label: '[스타일]', color: 'hover:border-amber-500 hover:text-amber-300' },
    { label: '[소설제목&태그&주요타겟독자층]', color: 'hover:border-violet-500 hover:text-violet-300' },
  ];

  const getSectionIcon = (title: string) => {
    if (title.includes('MALE_LEAD') || title.includes('남성')) return <UserCheck className="w-4 h-4 text-indigo-400" />;
    if (title.includes('FEMALE_LEAD') || title.includes('여성')) return <Heart className="w-4 h-4 text-fuchsia-400" />;
    if (title.includes('SUPPORTING_CAST') || title.includes('보조인물')) return <Users className="w-4 h-4 text-emerald-400" />;
    if (title.includes('STYLE') || title.includes('스타일')) return <Palette className="w-4 h-4 text-amber-400" />;
    return <BookText className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900/95 border-r border-zinc-800 select-text overflow-hidden">
      {/* 1. Chat Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-violet-900/50">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
              AI Co-pilot Chat
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-zinc-400">Gemini 2.5 Flash 실시간 연동</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowModelConfig(!showModelConfig)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              showModelConfig
                ? 'bg-violet-900/60 border-violet-600 text-violet-200'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Gemini 모델 매개변수 및 토큰 설정"
          >
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[11px] font-mono hidden sm:inline">모델 제어</span>
            {showModelConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectStep(1)}
            className={`text-[11px] px-2 py-1 rounded border font-mono transition-colors ${
              activeStep === 1
                ? 'bg-violet-900/80 text-violet-200 border-violet-600 font-bold'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            Step {activeStep}
          </button>
        </div>
      </div>

      {/* Model Parameter Controller Drawer */}
      {showModelConfig && (
        <div className="shrink-0 p-3.5 bg-zinc-950 border-b border-zinc-800 space-y-3 text-xs animate-slide-down">
          <div className="flex items-center justify-between text-zinc-300 font-bold">
            <span className="flex items-center gap-1.5 text-violet-300">
              <Sliders className="w-3.5 h-3.5" /> 모델 파라미터 & 최대 토큰 제어기
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">
              Tokens: {modelConfig.maxOutputTokens || 3500}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => applyModelPreset('creative')}
              className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                modelConfig.presetName === 'creative'
                  ? 'border-fuchsia-500 bg-fuchsia-950/60 text-fuchsia-200'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-fuchsia-400" />
              <span className="text-[10px] font-bold">파격·관능 극대화</span>
              <span className="text-[9px] opacity-70">4,500 토큰</span>
            </button>

            <button
              type="button"
              onClick={() => applyModelPreset('balanced')}
              className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                modelConfig.presetName === 'balanced'
                  ? 'border-violet-500 bg-violet-950/60 text-violet-200'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-bold">표준 웹소설</span>
              <span className="text-[9px] opacity-70">3,500 토큰</span>
            </button>

            <button
              type="button"
              onClick={() => applyModelPreset('precise')}
              className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                modelConfig.presetName === 'precise'
                  ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-bold">정밀·치밀함</span>
              <span className="text-[9px] opacity-70">2,500 토큰</span>
            </button>
          </div>

          <div className="pt-1.5 border-t border-zinc-800/80 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Hash className="w-3 h-3" /> 최대 출력 토큰 수
                </span>
                <span className="font-mono text-emerald-300 font-bold">{modelConfig.maxOutputTokens || 3500} 토큰</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="250"
                value={modelConfig.maxOutputTokens || 3500}
                onChange={(e) => {
                  const updated = { ...modelConfig, maxOutputTokens: parseInt(e.target.value, 10), presetName: undefined };
                  setModelConfig(updated);
                  if (onUpdateModelConfig) onUpdateModelConfig(updated);
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>창의성 (Temperature: {modelConfig.temperature})</span>
                <span className="text-zinc-500">샘플링 (Top-P: {modelConfig.topP})</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.1"
                step="0.05"
                value={modelConfig.temperature}
                onChange={(e) => {
                  const updated = { ...modelConfig, temperature: parseFloat(e.target.value), presetName: undefined };
                  setModelConfig(updated);
                  if (onUpdateModelConfig) onUpdateModelConfig(updated);
                }}
                className="w-full accent-violet-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Messages Scroll Area */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs overscroll-contain"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-zinc-400">
              {m.sender === 'assistant' ? (
                <>
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span className="text-violet-300 font-medium">Co-pilot</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-zinc-400" />
                  <span>작가님</span>
                </>
              )}
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`rounded-2xl px-3.5 py-2.5 max-w-[94%] leading-relaxed whitespace-pre-wrap break-words ${
                m.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none shadow-sm shadow-violet-900/30'
                  : 'bg-zinc-800/95 border border-zinc-700/60 text-zinc-200 rounded-tl-none shadow-sm'
              }`}
            >
              {m.text}

              {/* ★ 제안된 액션 카드 및 [대시보드에 반영하기] 버튼 */}
              {m.proposedAction && (
                <div className="mt-3.5 pt-3 border-t border-zinc-700/80 bg-zinc-950/80 p-3.5 rounded-xl space-y-2.5 border border-indigo-900/50 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      {getSectionIcon(m.proposedAction.summaryTitle)}
                      {m.proposedAction.summaryTitle} 설정 제안
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      m.isApplied
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    }`}>
                      {m.isApplied ? '✓ 반영 완료됨' : '반영 대기 중'}
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 rounded-lg p-2.5 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-400 font-semibold mb-1">적용될 주요 세부 사항:</div>
                    <ul className="space-y-1 text-[11px] text-zinc-200">
                      {m.proposedAction.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 shrink-0">•</span>
                          <span className="leading-snug">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ★ 사용자가 클릭했을 때만 실제 캐릭터/섹션 정보에 반영 */}
                  <button
                    type="button"
                    onClick={() => handleApplyAction(m.id, m.proposedAction!)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      m.isApplied
                        ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-violet-900/40 hover:scale-[1.01]'
                    }`}
                  >
                    {m.isApplied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>대시보드에 재반영하기</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>[반영하기] 클릭하여 대시보드에 적용</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs py-2 px-1">
            <div className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center animate-spin">
              <RefreshCw className="w-3 h-3 text-violet-400" />
            </div>
            <span className="text-zinc-400 text-[11px]">Gemini가 내용을 정밀 분석하여 [반영하기] 카드를 준비 중...</span>
          </div>
        )}
      </div>

      {/* 3. Section Tag Insertion Bar */}
      <div className="shrink-0 px-3 pt-2 pb-1.5 border-t border-zinc-800 bg-zinc-950/80">
        <div className="text-[10px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
          <Tag className="w-3 h-3 text-violet-400" />
          <span>원클릭 섹션 태그 삽입 (클릭 시 입력창에 태그 추가):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sectionTags.map((sec) => (
            <button
              key={sec.label}
              type="button"
              onClick={() => insertTag(sec.label)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800 transition-all cursor-pointer ${sec.color}`}
            >
              + {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Input Box */}
      <div className="shrink-0 p-3 border-t border-zinc-800 bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <textarea
            ref={inputRef}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="예: [남성주인공] 이름은 최창환, 24세 전도사. 평소엔 깍듯하지만 단둘이선 차갑게 명령하는 지배자 말투로 채워줘..."
            rows={2}
            className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 pr-10"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-colors cursor-pointer"
            title="전송 (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 px-1">
          <span>Shift+Enter 줄바꿈</span>
          <span className="text-indigo-400 font-mono">제안 후 [반영하기] 버튼 클릭 시 확정</span>
        </div>
      </div>
    </div>
  );
};
