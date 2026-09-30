import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, RefreshCw, Compass, Lightbulb, 
  Wand2, ArrowRight, MessageSquareText, FileText, Check, 
  Layers, ChevronRight, Zap
} from 'lucide-react';
import { NovelSettings, Episode, CommenterPersona, ChatMessage, ActionProposal } from '../types';
import { askNovelAssistant } from '../services/geminiService';

interface ChatPanelProps {
  currentStep: number;
  settings: NovelSettings;
  episodes: Episode[];
  personas: CommenterPersona[];
  onApplyActionProposal: (proposal: ActionProposal) => void;
  onNavigateStep: (step: number) => void;
}

// Safely convert any value (string, object, array, number) to truncated preview string
const safePreviewText = (val: any, maxLen: number = 50): string => {
  if (val == null) return '';
  let str = '';
  if (typeof val === 'string') {
    str = val;
  } else if (typeof val === 'object') {
    try {
      str = Object.entries(val)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ');
    } catch {
      str = JSON.stringify(val);
    }
  } else {
    str = String(val);
  }
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  currentStep,
  settings,
  episodes,
  personas,
  onApplyActionProposal,
  onNavigateStep,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `반갑습니다, 작가님. 당신의 전담 웹소설 디렉터 AI입니다. ✍️
현재 **${currentStep}단계**를 진행 중이십니다.

채팅창에 명령이나 아이디어를 말씀하시면, 대화 답변과 함께 **현재 단계(${currentStep}단계)의 구체적인 설정/플롯/본문/댓글러에 즉시 반영할 수 있는 전용 적용 버튼**이 생성됩니다!`,
      timestamp: '방금 전'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await askNovelAssistant(textToSend, {
        currentStep,
        settings,
        episodes,
        personas
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: response.proposal
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposal = (msgId: string, proposal: ActionProposal) => {
    onApplyActionProposal(proposal);
    // Mark as applied in message state
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.proposal) {
          return {
            ...m,
            proposal: { ...m.proposal, applied: true }
          };
        }
        return m;
      })
    );
    showToast(`✓ [${proposal.targetStep}단계]에 성공적으로 반영되었습니다!`);
  };

  // Step-specific contextual suggestion prompts focused on the genre
  const getQuickPrompts = () => {
    switch (currentStep) {
      case 1:
        return [
          '남주인공을 더 냉혹하고 치밀한 성격으로 디테일 보강해서 1단계에 반영해줘',
          '여주인공 전도사의 내면 메조히즘 갈등을 구체적으로 수정해서 1단계에 반영해줘',
          '제목을 더 파격적이고 배덕감 넘치게 추천해서 1단계에 적용해줘'
        ];
      case 2:
        return [
          '5단계(첫 관문 통과)에 심야 본당 뒷편 체벌 에피소드를 2단계 플롯에 추가해줘',
          '8단계(절체절명 시련)에 비밀 쪽지가 들통날 위기 에피소드를 2단계 플롯에 추가해줘',
          '청년부 여름 수련회 기도원 고립 에피소드를 2단계 플롯에 등록해줘'
        ];
      case 3:
        return [
          '지금 에피소드 본문으로 쓸 수 있는 팽팽한 호흡의 본문 원고를 작성해서 3단계에 반영해줘',
          '성가대실에서 비밀 규칙을 하달하는 텐션 높은 본문을 3단계에 채워줘'
        ];
      case 4:
        return [
          '선택된 문장의 감각 묘사와 서늘한 텐션을 극대화해줘',
          '찬송가 가사와 육체적 복종을 교차시키는 문장으로 다듬어줘'
        ];
      case 5:
        return [
          '더쿠에서 과몰입해서 울부짖는 새 댓글러 페르소나를 5단계에 추가해줘',
          '노벨피아에서 연하남 조교 빌드업을 찬양하는 댓글러 페르소나를 5단계에 추가해줘'
        ];
      case 6:
        return [
          '웹 뷰어 독자들을 사로잡을 강렬한 1화 첫 문단 피드백 줘',
          '작품 소개글(카피라이팅) 3종 추천해줘'
        ];
      default:
        return ['배덕감 극대화 연출', '심리 조교 규칙 추천', '교회물 클리셰 비틀기'];
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 text-slate-200 relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 z-50 p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xl flex items-center justify-between animate-bounce">
          <span>{toastMessage}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-wide text-white">스토리 디렉터 AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                실시간 연동
              </span>
            </div>
            <p className="text-xs text-slate-400">현재 <span className="text-brand-400 font-medium">{currentStep}단계</span> 기획을 실시간 지원 중</p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: `reset-${Date.now()}`,
                role: 'assistant',
                content: `대화가 새로 정리되었습니다. 현재 **${currentStep}단계**에 맞추어 창작에 필요한 질문과 명령을 내려주세요! 💡`,
                timestamp: '방금 전'
              }
            ]);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="대화 내역 초기화"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              )}
              <div
                className={`rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm ml-4'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-1.5 flex justify-end ${
                    msg.role === 'user' ? 'text-brand-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Direct Action Proposal Card if present */}
            {msg.proposal && msg.proposal.payload && (
              <div className="ml-10 max-w-[88%] w-full bg-slate-950/90 border border-brand-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                    <span>[{msg.proposal.targetStep}단계 즉시 반영 추천]</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {msg.proposal.type}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium">
                  {msg.proposal.summary}
                </p>

                {/* Safe payload sneak-peek */}
                <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono max-h-24 overflow-y-auto space-y-0.5">
                  {msg.proposal.type === 'update_settings' && (
                    <div>
                      {msg.proposal.payload.title && <div>• 제목: {safePreviewText(msg.proposal.payload.title, 40)}</div>}
                      {msg.proposal.payload.maleLead && <div>• 남주: {safePreviewText(msg.proposal.payload.maleLead, 50)}</div>}
                      {msg.proposal.payload.femaleLead && <div>• 여주: {safePreviewText(msg.proposal.payload.femaleLead, 50)}</div>}
                      {msg.proposal.payload.synopsis && <div>• 시놉시스: {safePreviewText(msg.proposal.payload.synopsis, 60)}</div>}
                    </div>
                  )}
                  {msg.proposal.type === 'add_episode' && (
                    <div>
                      <div>• 에피소드: {safePreviewText(msg.proposal.payload.title, 40)}</div>
                      <div>• 단계: {safePreviewText(msg.proposal.payload.stageTitle, 30)}</div>
                      <div>• 요약: {safePreviewText(msg.proposal.payload.summary, 60)}</div>
                    </div>
                  )}
                  {msg.proposal.type === 'replace_content' && (
                    <div>
                      <div>• 본문 내용: {safePreviewText(msg.proposal.payload.content, 80)}</div>
                    </div>
                  )}
                  {msg.proposal.type === 'add_persona' && (
                    <div>
                      <div>• 닉네임: {safePreviewText(msg.proposal.payload.name, 20)} ({safePreviewText(msg.proposal.payload.platform, 15)})</div>
                      <div>• 말투: "{safePreviewText(msg.proposal.payload.toneStyle, 40)}"</div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleExecuteProposal(msg.id, msg.proposal!)}
                  disabled={msg.proposal.applied}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                    msg.proposal.applied
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/20 active:scale-95'
                  }`}
                >
                  {msg.proposal.applied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{msg.proposal.targetStep}단계에 반영 완료됨</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5" />
                      <span>{msg.proposal.label}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-brand-400 p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI가 단계별 반영 데이터와 아이디어를 분석하고 있습니다...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>현재 {currentStep}단계 직접 반영 추천 명령:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {getQuickPrompts().map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700/70 transition flex items-center gap-1 text-left"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`현재 ${currentStep}단계에 반영할 지시를 입력하세요 (예: 남주 설정 변경, N화 추가 등)...`}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-3.5 pr-11 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
