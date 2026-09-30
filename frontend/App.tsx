import React, { useState, useEffect } from 'react';
import { NovelSettings, Episode, CommenterPersona, EpisodeComment, ProjectFullData, ActionProposal } from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_PERSONAS, 
  INITIAL_EPISODES 
} from './constants';
import { ChatPanel } from './components/ChatPanel';
import { Step1Settings } from './components/Step1Settings';
import { Step2Outline } from './components/Step2Outline';
import { Step3Writing } from './components/Step3Writing';
import { Step4Refine } from './components/Step4Refine';
import { Step5Comments } from './components/Step5Comments';
import { Step6Viewer } from './components/Step6Viewer';
import { AuthLockScreen } from './components/AuthLockScreen';
import { MarkdownSyncModal } from './components/MarkdownSyncModal';
import { 
  BookMarked, PenTool, GitBranch, FileEdit, 
  Sparkles, MessageSquare, MonitorPlay, Save, 
  CheckCircle, ChevronRight, Menu, X, FileText, 
  LogOut, ShieldCheck 
} from 'lucide-react';

export default function App() {
  // Authentication gate: Must login to enter
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return sessionStorage.getItem('storyforge_auth_user') || null;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState<boolean>(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('로컬 자동저장');

  // Load from localStorage or use defaults
  const [settings, setSettings] = useState<NovelSettings>(() => {
    const saved = localStorage.getItem('storyforge_settings_v2');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [episodes, setEpisodes] = useState<Episode[]>(() => {
    const saved = localStorage.getItem('storyforge_episodes_v2');
    return saved ? JSON.parse(saved) : INITIAL_EPISODES;
  });

  const [personas, setPersonas] = useState<CommenterPersona[]>(() => {
    const saved = localStorage.getItem('storyforge_personas_v2');
    return saved ? JSON.parse(saved) : INITIAL_PERSONAS;
  });

  const [comments, setComments] = useState<EpisodeComment[]>(() => {
    const saved = localStorage.getItem('storyforge_comments_v2');
    if (saved) return JSON.parse(saved);

    // Initial church mentor-mentee binge comments
    return [
      {
        id: 'c-1',
        episodeId: 'ep-1',
        personaId: 'p-1',
        personaName: '배덕감중독자',
        platform: '리디북스',
        content: '성가대 지휘석에서 입모양으로 [기.도.실.] 하는 거 미쳤냐고 ㅠㅠㅠ 서경 전도사 무릎 떨리는 묘사에서 심장 터짐',
        likes: 38,
        dislikes: 0,
        createdAt: '1시간 전',
        reactionTag: '텐션폭발'
      },
      {
        id: 'c-2',
        episodeId: 'ep-1',
        personaId: 'p-2',
        personaName: '교회다녀본사람',
        platform: '더쿠',
        content: '와 주일 3부 예배 축도 끝나고 나가는 그 성도들 바글바글한 공기 속에서 은밀하게 둘만 시선 교환하는 거 개현실적이라 더 배덕함;',
        likes: 27,
        dislikes: 1,
        createdAt: '45분 전',
        reactionTag: '과몰입'
      },
      {
        id: 'c-3',
        episodeId: 'ep-2',
        personaId: 'p-3',
        personaName: '강민우소유권주장',
        platform: '노벨피아',
        content: '1화에서 뜸들이더니 2화 오자마자 성경책 뺏고 무릎 꿇리기 + 뺨 찰싹 ㄷㄷㄷ 연하남 통제력 개살벌하네 ㅋㅋㅋㅋ',
        likes: 45,
        dislikes: 0,
        createdAt: '30분 전',
        reactionTag: '배덕감'
      },
      {
        id: 'c-4',
        episodeId: 'ep-2',
        personaId: 'p-5',
        personaName: '심야묵상',
        platform: '조아라',
        content: '종교적 죄의식과 메조히즘의 쾌락을 오가는 여주의 내면 심리가 너무나 처연하고 아름답습니다. 작가님 필력에 경의를 표합니다.',
        likes: 19,
        dislikes: 0,
        createdAt: '15분 전',
        reactionTag: '분석'
      }
    ];
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('storyforge_settings_v2', JSON.stringify(settings));
    localStorage.setItem('storyforge_episodes_v2', JSON.stringify(episodes));
    localStorage.setItem('storyforge_personas_v2', JSON.stringify(personas));
    localStorage.setItem('storyforge_comments_v2', JSON.stringify(comments));
    setSaveStatus('저장됨');
    const timer = setTimeout(() => setSaveStatus('로컬 자동저장'), 1500);
    return () => clearTimeout(timer);
  }, [settings, episodes, personas, comments]);

  const handleLogout = () => {
    if (confirm('스튜디오에서 로그아웃하시겠습니까? (작업 중인 내용은 안전하게 자동 저장되어 있습니다.)')) {
      sessionStorage.removeItem('storyforge_auth_user');
      setCurrentUser(null);
    }
  };

  const handleImportMarkdownData = (data: ProjectFullData) => {
    setSettings(data.settings);
    setEpisodes(data.episodes);
    setPersonas(data.personas);
    setComments(data.comments);
    setIsMarkdownModalOpen(false);
    alert(`[${data.settings.title}] 원고를 성공적으로 불러왔습니다! 이어서 집필을 시작하세요.`);
  };

  // Direct application of Action Proposal from Chat
  const handleApplyActionProposal = (proposal: ActionProposal) => {
    switch (proposal.type) {
      case 'update_settings': {
        const payload = { ...proposal.payload };
        // Defensively sanitize object values to strings so that textareas and string functions don't crash
        const stringFields = ['title', 'genre', 'maleLead', 'femaleLead', 'supportingChars', 'writingStyle', 'storyPov', 'narrativeTense', 'targetAudience', 'synopsis'];
        stringFields.forEach(field => {
          if (payload[field] && typeof payload[field] === 'object' && !Array.isArray(payload[field])) {
            try {
              payload[field] = Object.entries(payload[field])
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            } catch {
              payload[field] = JSON.stringify(payload[field]);
            }
          }
        });

        setSettings(prev => ({
          ...prev,
          ...payload
        }));
        // Switch to Step 1 so the user immediately sees the change
        setCurrentStep(1);
        break;
      }

      case 'add_episode': {
        const payload = proposal.payload;
        const newEp: Episode = {
          id: `ep-${Date.now()}`,
          stageId: typeof payload.stageId === 'number' ? payload.stageId : 1,
          stageTitle: typeof payload.stageTitle === 'string' ? payload.stageTitle : '새로운 단계',
          epNumber: episodes.length + 1,
          title: typeof payload.title === 'string' ? payload.title : `제${episodes.length + 1}화. 새로운 전개`,
          summary: typeof payload.summary === 'string' ? payload.summary : '',
          keyEvents: Array.isArray(payload.keyEvents) ? payload.keyEvents : ['사건 1', '사건 2'],
          conflict: typeof payload.conflict === 'string' ? payload.conflict : '',
          content: typeof payload.content === 'string' ? payload.content : ''
        };
        setEpisodes(prev => [...prev, newEp]);
        // Switch to Step 2 to view outline
        setCurrentStep(2);
        break;
      }

      case 'update_episode': {
        const payload = proposal.payload;
        setEpisodes(prev =>
          prev.map(ep => {
            if (payload.id && ep.id === payload.id) {
              return { ...ep, ...payload };
            }
            return ep;
          })
        );
        setCurrentStep(2);
        break;
      }

      case 'replace_content': {
        const newContent = typeof proposal.payload?.content === 'string' 
          ? proposal.payload.content 
          : JSON.stringify(proposal.payload?.content || '');
        // Apply to current active or first episode
        setEpisodes(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[0] = { ...updated[0], content: newContent };
          return updated;
        });
        setCurrentStep(3);
        break;
      }

      case 'append_content': {
        const appendText = typeof proposal.payload?.content === 'string' 
          ? proposal.payload.content 
          : JSON.stringify(proposal.payload?.content || '');
        setEpisodes(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[0] = { 
            ...updated[0], 
            content: (updated[0].content ? updated[0].content + '\n\n' : '') + appendText 
          };
          return updated;
        });
        setCurrentStep(3);
        break;
      }

      case 'add_persona': {
        const payload = proposal.payload;
        const newPersona: CommenterPersona = {
          id: `p-${Date.now()}`,
          name: typeof payload.name === 'string' ? payload.name : '새독자',
          platform: payload.platform || '노벨피아',
          age: typeof payload.age === 'string' ? payload.age : '20대',
          gender: typeof payload.gender === 'string' ? payload.gender : '여성',
          personality: typeof payload.personality === 'string' ? payload.personality : '',
          toneStyle: typeof payload.toneStyle === 'string' ? payload.toneStyle : '',
          favoriteGenre: typeof payload.favoriteGenre === 'string' ? payload.favoriteGenre : '로맨스',
          avatarColor: payload.avatarColor || 'bg-indigo-600'
        };
        setPersonas(prev => [...prev, newPersona]);
        setCurrentStep(5);
        break;
      }

      case 'add_comment': {
        const payload = proposal.payload;
        const targetEpId = episodes[0]?.id || 'ep-1';
        const newComment: EpisodeComment = {
          id: `c-${Date.now()}`,
          episodeId: payload.episodeId || targetEpId,
          personaId: payload.personaId || 'chat-persona',
          personaName: typeof payload.personaName === 'string' ? payload.personaName : '독자',
          platform: payload.platform || '노벨피아',
          content: typeof payload.content === 'string' ? payload.content : '',
          likes: payload.likes || 1,
          dislikes: 0,
          createdAt: '방금 전',
          reactionTag: payload.reactionTag || '과몰입'
        };
        setComments(prev => [newComment, ...prev]);
        setCurrentStep(5);
        break;
      }

      default:
        console.warn('Unknown proposal type:', proposal.type);
    }
  };

  // If user is not authenticated, render Login Lock Screen
  if (!currentUser) {
    return <AuthLockScreen onLoginSuccess={(userId) => setCurrentUser(userId)} />;
  }

  const stepsList = [
    { num: 1, label: '1단계: 설정 기획', icon: BookMarked },
    { num: 2, label: '2단계: 12단계 플롯', icon: GitBranch },
    { num: 3, label: '3단계: 본문 집필', icon: PenTool },
    { num: 4, label: '4단계: AI 부분 퇴고', icon: FileEdit },
    { num: 5, label: '5단계: 독자 댓글 생성', icon: MessageSquare },
    { num: 6, label: '6단계: 웹 뷰어 시연', icon: MonitorPlay },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT SIDE: AI Chat Assistant with Direct Step Action Proposals */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 md:w-96 lg:w-[410px] transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileChatOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ChatPanel
          currentStep={currentStep}
          settings={settings}
          episodes={episodes}
          personas={personas}
          onApplyActionProposal={handleApplyActionProposal}
          onNavigateStep={(step) => setCurrentStep(step)}
        />
      </div>

      {/* Mobile backdrop */}
      {isMobileChatOpen && (
        <div
          onClick={() => setIsMobileChatOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* RIGHT SIDE: Main 6-Step Workflow Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
              <span className="font-extrabold text-sm tracking-tight text-white">StoryForge AI</span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">| 웹소설 창작 스튜디오</span>
            </div>
          </div>

          {/* Step Breadcrumbs Indicator */}
          <div className="hidden lg:flex items-center gap-1">
            {stepsList.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : isPast
                      ? 'text-brand-400 hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Bar (Markdown Sync, User & Logout) */}
          <div className="flex items-center gap-2">
            {/* Markdown Export/Import Button */}
            <button
              onClick={() => setIsMarkdownModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-brand-600/30 hover:border-brand-500/50 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              title="마크다운 파일로 저장 및 불러오기"
            >
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">마크다운 저장/불러오기</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1 font-mono">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              {saveStatus}
            </span>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="text-white font-semibold hidden md:inline">{currentUser} 작가님</span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-red-400 transition"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Step Bar */}
        <div className="lg:hidden flex overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 py-1.5 gap-1 scrollbar-none">
          {stepsList.map((step) => (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
                currentStep === step.num
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        {/* Dynamic Step View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentStep === 1 && (
            <Step1Settings
              settings={settings}
              onChange={setSettings}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Outline
              settings={settings}
              episodes={episodes}
              onChangeEpisodes={setEpisodes}
              onNext={() => setCurrentStep(3)}
              onPrev={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Writing
              settings={settings}
              episodes={episodes}
              onChangeEpisodes={setEpisodes}
              onNext={() => setCurrentStep(4)}
              onPrev={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Refine
              settings={settings}
              episodes={episodes}
              onChangeEpisodes={setEpisodes}
              onNext={() => setCurrentStep(5)}
              onPrev={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5Comments
              settings={settings}
              episodes={episodes}
              personas={personas}
              comments={comments}
              onChangePersonas={setPersonas}
              onChangeComments={setComments}
              onNext={() => setCurrentStep(6)}
              onPrev={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6Viewer
              settings={settings}
              episodes={episodes}
              comments={comments}
              onPrev={() => setCurrentStep(5)}
            />
          )}
        </main>
      </div>

      {/* Markdown Export & Import Modal */}
      <MarkdownSyncModal
        isOpen={isMarkdownModalOpen}
        onClose={() => setIsMarkdownModalOpen(false)}
        settings={settings}
        episodes={episodes}
        personas={personas}
        comments={comments}
        onImportSuccess={handleImportMarkdownData}
      />
    </div>
  );
}
