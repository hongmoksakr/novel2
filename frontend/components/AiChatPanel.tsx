import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, RefreshCw, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ChatMessage, NovelProjectState } from '../types';
import { askAiCopilot } from '../services/geminiService';

interface AiChatPanelProps {
  projectState: NovelProjectState;
  activeStep: number;
  onStateAction: (actionType: string, payload: any) => void;
  onSelectStep: (stepNumber: number) => void;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  projectState,
  activeStep,
  onStateAction,
  onSelectStep,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `반갑습니다, 작가님! K-웹소설 전용 AI Co-pilot입니다. 
좌측 채팅창에서 질문하거나 피드백을 주시면, 1~6단계 우측 대시보드 상태를 즉시 직접 수정·동기화해 드립니다.

💡 다음과 같이 편하게 지시해 보세요:
• "1단계 여주의 숨겨진 성향을 더 매혹적으로 다듬어줘"
• "2단계에 4번째 에피소드 하나 추가해줘"
• "현재 설정에 어울리는 파격적인 결말 복선 제안해줘"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
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
      });

      let appliedNotice = undefined;
      if (response.action) {
        onStateAction(response.action.type, response.action.payload);
        appliedNotice = `[동기화 완료: ${response.action.type}]`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appliedAction: appliedNotice,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: '죄송합니다. 응답 생성 중 오류가 발생했습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPills = [
    { label: '여주 매력 강화', prompt: '1단계 여주의 피학적 욕망과 매력을 더 감각적이고 치명적으로 보강해줘' },
    { label: '4화 에피소드 추가', prompt: '2단계에 4화로 수련회 야간 밀회 에피소드를 추가해줘' },
    { label: '대사 수위 코칭', prompt: '남주 전도사의 지배적이고 거친 대사 어투 가이드를 추천해줘' },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 border-r border-zinc-800 flex-shrink-0">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
              AI Co-pilot Chat
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-zinc-400">우측 6단계 대시보드 실시간 반영 연동</p>
          </div>
        </div>
        <div className="text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60 font-mono">
          Step {activeStep} 포커스
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
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
              className={`rounded-2xl px-3.5 py-2.5 max-w-[92%] leading-relaxed whitespace-pre-wrap break-words ${
                m.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none shadow-sm shadow-violet-900/30'
                  : 'bg-zinc-800/95 border border-zinc-700/60 text-zinc-200 rounded-tl-none shadow-sm'
              }`}
            >
              {m.text}

              {m.appliedAction && (
                <div className="mt-2 pt-2 border-t border-zinc-700 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-medium">
                  <Zap className="w-3 h-3" />
                  {m.appliedAction}
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
            <span className="text-zinc-400 text-[11px]">AI가 응답을 생성하며 대시보드를 검토 중...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-3 pt-2 pb-1 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => handleSend(pill.prompt)}
            disabled={isTyping}
            className="flex-shrink-0 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Wand2 className="w-2.5 h-2.5 text-violet-400" />
            {pill.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="채팅으로 수정 사항을 지시하세요 (예: 1단계 여주 외모를 더 가녀리게 바꿔줘)..."
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
          <span>Shift+Enter로 줄바꿈</span>
          <span>상태 자동 실시간 반영</span>
        </div>
      </div>
    </div>
  );
};
