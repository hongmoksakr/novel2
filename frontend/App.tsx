import React, { useState, useEffect } from 'react';
import { NovelProjectState, ChapterDraft, EpisodeCard, CommenterPersona, EpisodeComment } from './types';
import { INITIAL_WORLDBUILDING, INITIAL_EPISODES, INITIAL_PERSONAS } from './constants';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { AiChatPanel } from './components/AiChatPanel';
import { Step1Worldbuilding } from './components/Step1Worldbuilding';
import { Step2Plotter } from './components/Step2Plotter';
import { Step3Drafting } from './components/Step3Drafting';
import { Step4Editor } from './components/Step4Editor';
import { Step5Comments } from './components/Step5Comments';
import { Step6Viewer } from './components/Step6Viewer';
import { BookText, Compass, PenTool, Edit3, MessageCircle, Eye, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'k_webnovel_studio_state_v1';

export const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('knovel_auth') === 'authenticated';
  });

  // Main Project State
  const [projectState, setProjectState] = useState<NovelProjectState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse local storage project', e);
      }
    }
    return {
      version: '1.2.0',
      savedAt: new Date().toISOString(),
      worldbuilding: INITIAL_WORLDBUILDING,
      episodes: INITIAL_EPISODES,
      drafts: {
        'ep-1': {
          episodeId: 'ep-1',
          episodeTitle: '제1화: 성가대실의 닫힌 문',
          volume: '100%',
          sensualIntensity: '150%',
          content: `비가 쏟아지는 수요일 저녁이었다.

수요 예배가 끝난 뒤에도 성가대실엔 서유진 혼자 남아 있었다. 
그녀는 건반 덮개를 닫지 못한 채, 성가대석 난간에 기댄 채 멍하니 빗소리를 듣고 있었다. 

"집사님."

등 뒤에서 낮고 차분한 목소리가 들려왔다.
뒤를 돌아보지 않아도 알 수 있었다. 지난달 우리 교회로 부임한 청년부 사역자, 스물네 살의 강태하 전도사였다.

"불이 켜져 있길래 와 봤습니다."

그가 천천히 다가왔다. 검은 셔츠 소매를 단정하게 걷어 올린 팔목 위로 푸른 핏줄이 서늘하게 돋아 있었다. 유진보다 여덟 살이나 어렸지만, 그의 앞에만 서면 유진은 늘 숨이 턱 끝까지 막혀왔다.

"아, 태하 전도사님... 악보 정리가 덜 끝나서요."

"거짓말을 하시는군요."

태하는 건반 앞에 멈춰 서서 유진을 내려다보았다. 그의 깊고 어두운 눈동자가 그녀의 떨리는 입술과 가녀린 목덜미를 찬찬히 훑어 내렸다.

"기도를 드리러 온 것도 아니고, 악보를 보는 것도 아니었습니다. 그저... 누군가 이곳에 들어와 문을 잠가주길 기다리신 표정이었는데요."

유진의 심장이 덜컥 내려앉았다. 그의 손끝이 악보를 짚는 척하며 유진의 손가락등을 은근하게 스쳐 지나갔다. 차가우면서도 소름 끼치도록 뜨거운 전율이 척추를 타고 번져나갔다.`,
          lastUpdated: new Date().toLocaleTimeString(),
        },
      },
      personas: INITIAL_PERSONAS,
      comments: [
        {
          id: 'c-init-1',
          episodeId: 'ep-1',
          personaId: 'p-1',
          authorName: '새벽기도3년차',
          platform: 'Theqoo',
          content: '와 첫 화부터 텐션 무슨 일이야 ㅠㅠㅠㅠ 연하 전도사 말투 개치명적임 진짜 심장 터질뻔함;;',
          upvotes: 84,
          timestamp: '1시간 전',
          isBest: true,
        },
        {
          id: 'c-init-2',
          episodeId: 'ep-1',
          personaId: 'p-2',
          authorName: '성경책던진놈',
          platform: 'ArcaLive',
          content: '성가대실에서 단둘이 비 내리는 날에 ㅋㅋㅋ 클리셰지만 도파민 GOAT 인정함 개추 박음',
          upvotes: 42,
          timestamp: '45분 전',
        },
      ],
    };
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeDraftEpisodeId, setActiveDraftEpisodeId] = useState<string>('ep-1');
  const [savedNotification, setSavedNotification] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Sync to local storage on mutation
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectState));
    setSavedNotification(true);
    const timer = setTimeout(() => setSavedNotification(false), 2500);
    return () => clearTimeout(timer);
  }, [projectState]);

  // Handle AI dynamic state action
  const handleAiAction = (actionType: string, payload: any) => {
    if (actionType === 'UPDATE_WORLDBUILDING') {
      const { field, value } = payload;
      setProjectState((prev) => ({
        ...prev,
        worldbuilding: {
          ...prev.worldbuilding,
          [field]: value,
        },
      }));
    } else if (actionType === 'ADD_EPISODE') {
      const newEp: EpisodeCard = {
        id: `ep-${Date.now()}`,
        stageNumber: payload.stageNumber || 2,
        subNumber: projectState.episodes.length + 1,
        title: payload.title || '새 에피소드',
        outline: payload.outline || '',
        keyConflict: payload.keyConflict || '',
        climaxPoint: payload.climaxPoint || '',
      };
      setProjectState((prev) => ({
        ...prev,
        episodes: [...prev.episodes, newEp],
      }));
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('knovel_auth');
    setIsAuthenticated(false);
  };

  const steps = [
    { num: 1, title: 'Step 1: 메타 & 세계관', icon: BookText },
    { num: 2, title: 'Step 2: 영웅의 여정 플롯', icon: Compass },
    { num: 3, title: 'Step 3: 본문 집필/수위 조절', icon: PenTool },
    { num: 4, title: 'Step 4: AI 선택 수정', icon: Edit3 },
    { num: 5, title: 'Step 5: 독자 댓글 시뮬레이션', icon: MessageCircle },
    { num: 6, title: 'Step 6: 웹소설 뷰어', icon: Eye },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-600 selection:text-white">
      {/* 0. Authentication Gate Lock Modal */}
      {!isAuthenticated && <AuthModal onSuccess={() => setIsAuthenticated(true)} />}

      {/* Main Studio Viewport (Rendered behind or when authenticated) */}
      <Header
        projectState={projectState}
        onImportState={(newState) => setProjectState(newState)}
        onLogout={handleLogout}
        savedNotification={savedNotification}
      />

      {/* Workspace Split-Pane Body */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-61px)]">
        {/* Left Pane (AI Co-pilot Chatbot) - 30~35% width */}
        <div
          className={`${
            isSidebarOpen ? 'w-full md:w-[32%] lg:w-[30%] min-w-[320px]' : 'hidden'
          } flex flex-col h-full border-r border-zinc-800 transition-all duration-200 z-20`}
        >
          <AiChatPanel
            projectState={projectState}
            activeStep={activeStep}
            onStateAction={handleAiAction}
            onSelectStep={(s) => setActiveStep(s)}
          />
        </div>

        {/* Right Pane (6-Step Dashboard) - 68~70% width */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Step Navigation Tabs Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {/* Toggle Left Sidebar Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mr-1 cursor-pointer"
                title={isSidebarOpen ? 'AI 채팅창 닫기' : 'AI 채팅창 열기'}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-violet-400" />}
              </button>

              {steps.map((st) => {
                const Icon = st.icon;
                const isActive = activeStep === st.num;
                return (
                  <button
                    key={st.num}
                    onClick={() => setActiveStep(st.num)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span>{st.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Component View Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeStep === 1 && (
              <Step1Worldbuilding
                world={projectState.worldbuilding}
                onChange={(updated) =>
                  setProjectState((prev) => ({ ...prev, worldbuilding: updated }))
                }
              />
            )}

            {activeStep === 2 && (
              <Step2Plotter
                episodes={projectState.episodes}
                onChangeEpisodes={(newEpisodes) =>
                  setProjectState((prev) => ({ ...prev, episodes: newEpisodes }))
                }
                onNavigateToDraft={(epId) => {
                  setActiveDraftEpisodeId(epId);
                  setActiveStep(3);
                }}
              />
            )}

            {activeStep === 3 && (
              <Step3Drafting
                world={projectState.worldbuilding}
                episodes={projectState.episodes}
                drafts={projectState.drafts}
                activeEpisodeId={activeDraftEpisodeId}
                onSelectEpisode={(id) => setActiveDraftEpisodeId(id)}
                onSaveDraft={(draft) =>
                  setProjectState((prev) => ({
                    ...prev,
                    drafts: {
                      ...prev.drafts,
                      [draft.episodeId]: draft,
                    },
                  }))
                }
                onNavigateToEditor={() => setActiveStep(4)}
              />
            )}

            {activeStep === 4 && (
              <Step4Editor
                world={projectState.worldbuilding}
                activeDraft={projectState.drafts[activeDraftEpisodeId]}
                onUpdateContent={(newContent) => {
                  setProjectState((prev) => {
                    const ep = prev.episodes.find((e) => e.id === activeDraftEpisodeId) || prev.episodes[0];
                    return {
                      ...prev,
                      drafts: {
                        ...prev.drafts,
                        [activeDraftEpisodeId]: {
                          episodeId: activeDraftEpisodeId,
                          episodeTitle: ep?.title || '에피소드',
                          volume: prev.drafts[activeDraftEpisodeId]?.volume || '100%',
                          sensualIntensity: prev.drafts[activeDraftEpisodeId]?.sensualIntensity || '150%',
                          content: newContent,
                          lastUpdated: new Date().toLocaleTimeString(),
                        },
                      },
                    };
                  });
                }}
              />
            )}

            {activeStep === 5 && (
              <Step5Comments
                personas={projectState.personas}
                comments={projectState.comments}
                episodes={projectState.episodes}
                onUpdatePersonas={(updated) =>
                  setProjectState((prev) => ({ ...prev, personas: updated }))
                }
                onAddComments={(newComments) =>
                  setProjectState((prev) => ({
                    ...prev,
                    comments: [...prev.comments, ...newComments],
                  }))
                }
              />
            )}

            {activeStep === 6 && <Step6Viewer projectState={projectState} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
