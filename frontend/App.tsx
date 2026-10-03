import React, { useState, useEffect } from 'react';
import { NovelProjectState, ChapterDraft, EpisodeCard, Step1Section, Step1SectionUpdate, ModelConfig } from './types';
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

const LOCAL_STORAGE_KEY = 'k_webnovel_studio_state_v5';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('knovel_auth') === 'authenticated';
  });

  const [projectState, setProjectState] = useState<NovelProjectState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.worldbuilding.parts) {
          parsed.worldbuilding.parts = INITIAL_WORLDBUILDING.parts;
        }
        if (!parsed.worldbuilding.mainSetting) {
          parsed.worldbuilding.mainSetting = INITIAL_WORLDBUILDING.mainSetting;
        }
        return parsed;
      } catch (e) {
        console.warn('Failed to parse local storage project', e);
      }
    }
    return {
      version: '5.0.0',
      savedAt: new Date().toISOString(),
      modelConfig: {
        modelName: 'gemini-2.5-flash',
        temperature: 0.85,
        topP: 0.95,
        thinkingBudget: 0,
        maxOutputTokens: 3500,
        presetName: 'creative'
      },
      worldbuilding: INITIAL_WORLDBUILDING,
      episodes: INITIAL_EPISODES,
      drafts: {},
      personas: INITIAL_PERSONAS,
      comments: [
        {
          id: 'c-init-1',
          episodeId: 'ep-1',
          personaId: 'p-1',
          authorName: '새벽기도3년차_원덬',
          platform: 'Theqoo',
          content: '와 첫 화부터 텐션 무슨 일이야 ㅠㅠㅠㅠ 연하 전도사 말투 개치명적임 진짜 심장 터질뻔함;;',
          upvotes: 84,
          timestamp: '1시간 전',
          isBest: true,
        },
        {
          id: 'c-init-2',
          episodeId: 'ep-1',
          personaId: 'p-3',
          authorName: '청년부_교회목격자',
          platform: 'Acquaintance',
          content: '미친... 나 실제 손세미 쌤이랑 최창환 전도사님 아는 교회 사람인데... 소설 속 둘이 성가대실에서 마주치는 장면 보고 소름 돋음 ㄷㄷ 현실에서 둘이 어색하게 눈 피하던 거 생각나서 배덕감 미쳤다 진짜',
          upvotes: 62,
          timestamp: '30분 전',
        },
      ],
    };
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeDraftEpisodeId, setActiveDraftEpisodeId] = useState<string>('ep-1');
  const [savedNotification, setSavedNotification] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [highlightedSections, setHighlightedSections] = useState<Step1Section[]>([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectState));
    setSavedNotification(true);
    const timer = setTimeout(() => setSavedNotification(false), 2500);
    return () => clearTimeout(timer);
  }, [projectState]);

  const handleAiAction = (actionType: string, payload: any) => {
    if (actionType === 'UPDATE_STEP1_MULTI_SECTIONS') {
      const updates = (payload.updates || []) as Step1SectionUpdate[];
      const touchedSecs: Step1Section[] = [];

      setProjectState((prev) => {
        const curWorld = { ...prev.worldbuilding };

        for (const upd of updates) {
          touchedSecs.push(upd.section);

          if (upd.section === 'MALE_LEAD') {
            curWorld.maleLead = {
              ...curWorld.maleLead,
              ...(upd.data.name !== undefined && { name: upd.data.name }),
              ...(upd.data.age !== undefined && { age: upd.data.age }),
              ...(upd.data.role !== undefined && { role: upd.data.role }),
              ...(upd.data.personality !== undefined && { personality: upd.data.personality }),
              ...(upd.data.appearance !== undefined && { appearance: upd.data.appearance }),
              ...(upd.data.speechStyle !== undefined && { speechStyle: upd.data.speechStyle }),
            };
          } else if (upd.section === 'FEMALE_LEAD') {
            curWorld.femaleLead = {
              ...curWorld.femaleLead,
              ...(upd.data.name !== undefined && { name: upd.data.name }),
              ...(upd.data.age !== undefined && { age: upd.data.age }),
              ...(upd.data.role !== undefined && { role: upd.data.role }),
              ...(upd.data.personality !== undefined && { personality: upd.data.personality }),
              ...(upd.data.appearance !== undefined && { appearance: upd.data.appearance }),
              ...(upd.data.speechStyle !== undefined && { speechStyle: upd.data.speechStyle }),
            };
          } else if (upd.section === 'SUPPORTING_CAST') {
            curWorld.supportingCharacters = Array.isArray(upd.data) ? upd.data : curWorld.supportingCharacters;
          } else if (upd.section === 'STYLE_AND_TIME') {
            if (upd.data.toneStyle !== undefined) curWorld.toneStyle = upd.data.toneStyle;
            if (upd.data.mainSetting !== undefined) curWorld.mainSetting = upd.data.mainSetting;
            if (upd.data.eventPov !== undefined) curWorld.eventPov = upd.data.eventPov;
            if (upd.data.eventYear !== undefined) curWorld.eventYear = upd.data.eventYear;
            if (upd.data.writingYear !== undefined) curWorld.writingYear = upd.data.writingYear;
            if (upd.data.writingTense !== undefined) curWorld.writingTense = upd.data.writingTense;
          } else if (upd.section === 'META_BASIC') {
            if (upd.data.title !== undefined) curWorld.title = upd.data.title;
            if (upd.data.tags !== undefined) curWorld.tags = upd.data.tags;
            if (upd.data.targetAudience !== undefined) curWorld.targetAudience = upd.data.targetAudience;
          }
        }

        return {
          ...prev,
          worldbuilding: curWorld,
        };
      });

      setHighlightedSections(touchedSecs);
      setTimeout(() => setHighlightedSections([]), 2500);
    } else if (actionType === 'UPDATE_WORLDBUILDING') {
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
        part: payload.part || 1,
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

  const handleUpdateEpisodeTitle = (episodeId: string, newTitle: string) => {
    setProjectState((prev) => ({
      ...prev,
      episodes: prev.episodes.map((ep) =>
        ep.id === episodeId ? { ...ep, title: newTitle } : ep
      ),
    }));
  };

  const handleUpdatePartInstruction = (partNumber: number, instruction: string) => {
    setProjectState((prev) => ({
      ...prev,
      worldbuilding: {
        ...prev.worldbuilding,
        parts: (prev.worldbuilding.parts || []).map((p) =>
          p.partNumber === partNumber ? { ...p, partInstruction: instruction } : p
        ),
      },
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    setProjectState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('knovel_auth');
    setIsAuthenticated(false);
  };

  const steps = [
    { num: 1, title: 'Step 1: 메타 & 세계관 (5대 섹션)', icon: BookText },
    { num: 2, title: 'Step 2: 영웅의 여정 플롯', icon: Compass },
    { num: 3, title: 'Step 3: 본문 집필/수위 조절', icon: PenTool },
    { num: 4, title: 'Step 4: AI 선택 수정', icon: Edit3 },
    { num: 5, title: 'Step 5: 독자 댓글 시뮬레이션', icon: MessageCircle },
    { num: 6, title: 'Step 6: 웹소설 뷰어', icon: Eye },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-600 selection:text-white overflow-hidden">
      {!isAuthenticated && <AuthModal onSuccess={() => setIsAuthenticated(true)} />}

      <div className="shrink-0">
        <Header
          projectState={projectState}
          onImportState={(newState) => setProjectState(newState)}
          onLogout={handleLogout}
          savedNotification={savedNotification}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-row overflow-hidden w-full relative">
        <div
          className={`${
            isSidebarOpen ? 'w-full md:w-[32%] lg:w-[30%] min-w-[320px]' : 'hidden'
          } h-full min-h-0 flex flex-col shrink-0 z-20 border-r border-zinc-800 transition-all duration-200`}
        >
          <AiChatPanel
            projectState={projectState}
            activeStep={activeStep}
            onStateAction={handleAiAction}
            onSelectStep={(s) => setActiveStep(s)}
            lastUpdatedSections={highlightedSections}
            onUpdateModelConfig={(cfg) => setProjectState((prev) => ({ ...prev, modelConfig: cfg }))}
          />
        </div>

        <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden bg-zinc-950">
          <div className="shrink-0 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none gap-2 z-10">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
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
                    type="button"
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

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain">
            {activeStep === 1 && (
              <Step1Worldbuilding
                world={projectState.worldbuilding}
                onChange={(updated) =>
                  setProjectState((prev) => ({ ...prev, worldbuilding: updated }))
                }
                highlightedSections={highlightedSections}
              />
            )}

            {activeStep === 2 && (
              <Step2Plotter
                episodes={projectState.episodes}
                parts={projectState.worldbuilding.parts}
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
                onUpdateEpisodeTitle={handleUpdateEpisodeTitle}
                onUpdatePartInstruction={handleUpdatePartInstruction}
                modelConfig={projectState.modelConfig}
              />
            )}

            {/* ★ Step4 에디터: episodes, drafts, activeEpisodeId, onSaveDraft 완전 연동 */}
            {activeStep === 4 && (
              <Step4Editor
                world={projectState.worldbuilding}
                episodes={projectState.episodes}
                drafts={projectState.drafts}
                activeEpisodeId={activeDraftEpisodeId}
                onSelectEpisode={(id) => setActiveDraftEpisodeId(id)}
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
                          episodeTitle: prev.drafts[activeDraftEpisodeId]?.episodeTitle || ep?.title || '에피소드',
                          volume: prev.drafts[activeDraftEpisodeId]?.volume || '100%',
                          sensualIntensity: prev.drafts[activeDraftEpisodeId]?.sensualIntensity || '150%',
                          content: newContent,
                          lastUpdated: new Date().toLocaleTimeString(),
                          customInstruction: prev.drafts[activeDraftEpisodeId]?.customInstruction,
                        },
                      },
                    };
                  });
                }}
                onSaveDraft={(draft) => {
                  setProjectState((prev) => ({
                    ...prev,
                    drafts: {
                      ...prev.drafts,
                      [draft.episodeId]: draft,
                    },
                  }));
                }}
              />
            )}

            {activeStep === 5 && (
              <Step5Comments
                personas={projectState.personas}
                comments={projectState.comments}
                episodes={projectState.episodes}
                world={projectState.worldbuilding}
                drafts={projectState.drafts}
                onUpdatePersonas={(updated) =>
                  setProjectState((prev) => ({ ...prev, personas: updated }))
                }
                onAddComments={(newComments) =>
                  setProjectState((prev) => ({
                    ...prev,
                    comments: [...prev.comments, ...newComments],
                  }))
                }
                onDeleteComment={handleDeleteComment}
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
