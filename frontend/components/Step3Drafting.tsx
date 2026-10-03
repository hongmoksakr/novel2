import React, { useState } from 'react';
import { WorldbuildingState, EpisodeCard, ChapterDraft, VolumeLevel, SensualLevel, ModelConfig, NovelPart } from '../types';
import { generateChapterDraftWithTitle, generatePartInstructionAI } from '../services/geminiService';
import { Sparkles, Sliders, Save, Flame, Clock, FileText, CheckCircle2, Edit, Check, Calendar, MessageSquare, Palette, MapPin, Users, BookOpen, AlertTriangle, Speech, Wand2, RefreshCw, CloudFog, ArrowRight } from 'lucide-react';

interface Step3Props {
  world: WorldbuildingState;
  episodes: EpisodeCard[];
  drafts: Record<string, ChapterDraft>;
  activeEpisodeId: string;
  onSelectEpisode: (epId: string) => void;
  onSaveDraft: (draft: ChapterDraft) => void;
  onNavigateToEditor: () => void;
  onUpdateEpisodeTitle?: (episodeId: string, newTitle: string) => void;
  onUpdatePartInstruction?: (partNumber: number, instruction: string) => void;
  modelConfig?: ModelConfig;
}

export const Step3Drafting: React.FC<Step3Props> = ({
  world,
  episodes,
  drafts,
  activeEpisodeId,
  onSelectEpisode,
  onSaveDraft,
  onNavigateToEditor,
  onUpdateEpisodeTitle,
  onUpdatePartInstruction,
  modelConfig,
}) => {
  const currentEp = episodes.find((e) => e.id === activeEpisodeId) || episodes[0];
  const currentDraft = currentEp ? drafts[currentEp.id] : undefined;

  const currentPartNumber = currentEp?.part || 1;
  const currentPartObj = (world.parts || []).find(p => p.partNumber === currentPartNumber);

  const currentPartInstruction = currentPartObj?.partInstruction || '';
  const [partInstructionLocal, setPartInstructionLocal] = useState<string>(currentPartInstruction);
  const [isGeneratingInstruction, setIsGeneratingInstruction] = useState<boolean>(false);
  const [instructionSavedToast, setInstructionSavedToast] = useState<boolean>(false);

  const [volume, setVolume] = useState<VolumeLevel>(currentDraft?.volume || '100%');
  const [sensual, setSensual] = useState<SensualLevel>(currentDraft?.sensualIntensity || '150%');
  const [content, setContent] = useState<string>(currentDraft?.content || '');
  const [episodeTitle, setEpisodeTitle] = useState<string>(currentDraft?.episodeTitle || currentEp?.title || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  const applicableSupportingCharacters = world.supportingCharacters.filter(s =>
    (s.appearingParts || [1]).includes(currentPartNumber)
  );

  React.useEffect(() => {
    if (currentPartObj) {
      setPartInstructionLocal(currentPartObj.partInstruction || '');
    }
  }, [currentPartNumber, currentPartObj?.partInstruction]);

  React.useEffect(() => {
    if (currentEp) {
      const draft = drafts[currentEp.id];
      if (draft) {
        setContent(draft.content);
        setVolume(draft.volume);
        setSensual(draft.sensualIntensity);
        setEpisodeTitle(draft.episodeTitle || currentEp.title);
      } else {
        setContent('');
        setEpisodeTitle(currentEp.title);
      }
    }
  }, [activeEpisodeId, drafts, currentEp]);

  const handleAutoGeneratePartInstruction = async () => {
    if (isGeneratingInstruction) return;
    setIsGeneratingInstruction(true);

    try {
      const generated = await generatePartInstructionAI(world, currentPartNumber);
      setPartInstructionLocal(generated);

      if (onUpdatePartInstruction) {
        onUpdatePartInstruction(currentPartNumber, generated);
      }

      setInstructionSavedToast(true);
      setTimeout(() => setInstructionSavedToast(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingInstruction(false);
    }
  };

  const handlePartInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setPartInstructionLocal(newVal);
    if (onUpdatePartInstruction) {
      onUpdatePartInstruction(currentPartNumber, newVal);
    }
  };

  const handleGenerate = async () => {
    if (!currentEp) return;
    setIsGenerating(true);

    try {
      const result = await generateChapterDraftWithTitle(
        world,
        currentEp,
        volume,
        sensual,
        partInstructionLocal,
        modelConfig
      );

      setContent(result.content);
      setEpisodeTitle(result.generatedTitle);

      const newDraft: ChapterDraft = {
        episodeId: currentEp.id,
        episodeTitle: result.generatedTitle,
        volume,
        sensualIntensity: sensual,
        content: result.content,
        lastUpdated: new Date().toLocaleTimeString(),
        customInstruction: partInstructionLocal,
      };

      onSaveDraft(newDraft);

      if (onUpdateEpisodeTitle) {
        onUpdateEpisodeTitle(currentEp.id, result.generatedTitle);
      }

      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = () => {
    if (!currentEp) return;
    const newDraft: ChapterDraft = {
      episodeId: currentEp.id,
      episodeTitle: episodeTitle,
      volume,
      sensualIntensity: sensual,
      content,
      lastUpdated: new Date().toLocaleTimeString(),
      customInstruction: partInstructionLocal,
    };
    onSaveDraft(newDraft);
    if (onUpdateEpisodeTitle) {
      onUpdateEpisodeTitle(currentEp.id, episodeTitle);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // ★ Step4 이동 시 현재 본문 확실히 저장 후 네비게이션
  const handleGoToStep4 = () => {
    if (currentEp) {
      const currentDraftToSave: ChapterDraft = {
        episodeId: currentEp.id,
        episodeTitle: episodeTitle || currentEp.title,
        volume,
        sensualIntensity: sensual,
        content: content,
        lastUpdated: new Date().toLocaleTimeString(),
        customInstruction: partInstructionLocal,
      };
      onSaveDraft(currentDraftToSave);
    }
    onNavigateToEditor();
  };

  const volumeOptions: { level: VolumeLevel; label: string; desc: string }[] = [
    { level: '100%', label: '100% (기본×1.25)', desc: '공백 포함 약 2,500 ~ 3,200자 (확장 기본)' },
    { level: '125%', label: '125% (확장×1.25)', desc: '공백 포함 약 4,000 ~ 4,800자 (대사·씬 확장)' },
    { level: '150%', label: '150% (상세×1.25)', desc: '공백 포함 약 5,600 ~ 6,900자 (심리·성애 대분량)' },
    { level: '175%', label: '175% (장대×1.25)', desc: '공백 포함 약 8,000 ~ 8,500자 (초대형 회차)' },
    { level: '200%', label: '200% (극대화×1.25)', desc: '공백 포함 약 10,000자 이상 (극대화 완결 분량)' },
  ];

  const sensualOptions: { level: SensualLevel; label: string; desc: string; danger?: boolean }[] = [
    { level: '100%', label: '100% (긴장 텐션)', desc: '은밀한 시선을 넘은 농밀한 신체 긴장과 스치는 손길의 떨림' },
    { level: '125%', label: '125% (고조·밀착)', desc: '노골적 애무와 복종의 신음, 주종 관계 아래 달아오르는 육체 통제' },
    { level: '150%', label: '150% (음탕·적나라)', desc: '수치심을 짓밟는 천박하고 질척한 신체 결합, 타액과 애액의 상세 묘사' },
    { level: '175%', label: '175% (극도의 배덕)', desc: '성스러운 교회 공간과 대비되는 음란한 체위, 애원을 묵살하는 거친 결박과 절정' },
    { level: '200%', label: '200% (극단의 음탕/천박)', desc: '필터링 없는 극단의 음탕함과 천박함! 날것의 체액과 질척이는 마찰음, 완벽한 암캐화', danger: true },
  ];

  const wordCount = content.length;
  const estimatedReadTime = Math.ceil(wordCount / 500);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-fuchsia-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-600 text-white">
              Step 3
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              본문 집필 및 정밀 수위/분량 조절기
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            <strong>[저자의 은밀한 상상 내용]</strong>이 현실 서사와 구체적으로 분리 태그(&lt;imagination&gt;)로 집필되며, 집필된 본문은 <strong>Step 4 에디터 및 Step 6 뷰어로 즉시 동기화</strong>됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">대상 에피소드:</label>
          <select
            value={currentEp?.id}
            onChange={(e) => onSelectEpisode(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white font-medium focus:border-violet-500 focus:outline-none"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                [{ep.part || 1}부] {ep.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 1 설정 종합 반영 파이프라인 인포 카드 */}
      <div className="rounded-xl border border-violet-800/60 bg-zinc-900/90 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-violet-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Step 1 설정 종합 반영 파이프라인 (본문 생성 프롬프트에 직접 주입):
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800/80 flex items-center gap-1 font-semibold">
              <CloudFog className="w-3 h-3" /> 상상 파트 구분 생성 On
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80 flex items-center gap-1 font-semibold">
              <Speech className="w-3 h-3" /> 독자 말걸기 화법 On
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-bold text-violet-300 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> [소설제목&태그&타겟독자]
            </div>
            <div className="text-zinc-200 font-semibold truncate">• 제목: {world.title}</div>
            <div className="text-zinc-400 truncate">• 태그: {world.tags.join(', ')}</div>
            <div className="text-amber-300 font-medium truncate">• 말걸기 타겟: {world.targetAudience}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-bold text-indigo-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> [남녀 주인공 및 대사 어투]
            </div>
            <div className="text-zinc-200 truncate">• 남주({world.maleLead.name || '최창환'}): {world.maleLead.speechStyle || '단정한 명령조'}</div>
            <div className="text-zinc-200 truncate">• 여주({world.femaleLead.name || '손세미'}): {world.femaleLead.speechStyle || '수치심 섞인 애원조'}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> [스타일 &amp; 보조인물]
            </div>
            <div className="text-zinc-200 truncate">• 무대: {world.mainSetting || '주사랑 개신교회 성가대실/사택'}</div>
            <div className="text-zinc-400 truncate">• 시점/시제: {world.eventYear}년 ({world.eventPov}) / {world.writingTense}</div>
            <div className="text-emerald-400 truncate">
              • {currentPartNumber}부 등장 보조인물: {applicableSupportingCharacters.length > 0 ? applicableSupportingCharacters.map(s => `${s.name}(${s.archetype})`).join(', ') : '없음'}
            </div>
          </div>
        </div>
      </div>

      {/* Episode Title Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            에피소드 회차 제목 (본문 생성 시 내용에 맞춰 자동 작명됨)
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="flex-1 rounded-lg border border-violet-500 bg-zinc-950 px-3 py-1.5 text-sm text-white font-bold"
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 rounded-lg bg-violet-600 text-xs font-semibold text-white cursor-pointer"
              >
                확인
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">{episodeTitle}</span>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                title="에피소드 제목 직접 수정"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono">
          {currentPartNumber}부 · Stage {currentEp?.stageNumber} · Sub #{currentEp?.subNumber}
        </div>
      </div>

      {/* [n부 전체 지침] 섹션 */}
      <div className="rounded-xl border border-indigo-800/80 bg-zinc-900/90 p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>[{currentPartNumber}부 전체 집필 지침] - 같은 {currentPartNumber}부 내 모든 에피소드에 공통 유지 적용</span>
          </label>

          <div className="flex items-center gap-2">
            {instructionSavedToast && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> AI 지침 도출 완료!
              </span>
            )}
            <button
              type="button"
              onClick={handleAutoGeneratePartInstruction}
              disabled={isGeneratingInstruction}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
              title="Step 1의 스타일 및 주요 타겟 독자층을 분석하여 n부 전체 집필 지침을 자동 작성"
            >
              {isGeneratingInstruction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              <span>&lt;AI 자동생성&gt; (스타일·타겟독자층 반영)</span>
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={partInstructionLocal}
          onChange={handlePartInstructionChange}
          placeholder={`예: ${currentPartNumber}부 전체는 ${world.mainSetting || '주사랑교회 성가대실'}의 폐쇄된 공간 안에서 타겟 독자층(${world.targetAudience})에게 비밀을 털어놓듯 말을 건네는 화법을 유지하며, 최창환의 차가운 존댓말 훈육과 손세미의 피학적 굴복을 긴장감 넘치게 연출할 것...`}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>* 이 지침은 <strong>{currentPartNumber}부 전체 에피소드에 공통 유지</strong>되며, 자유롭게 직접 수정할 수 있습니다.</span>
          <span className="text-fuchsia-400 font-medium">💡 본문 내 &lt;imagination&gt; 태그로 저자의 상상 파트가 자동 구분됩니다.</span>
        </div>
      </div>

      {/* Control Levers Grid (1.25배 증폭 Volume & Sensual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              1. 분량 조절기 (Volume Ratio - 1.25배 확장 적용)
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded">
              {volume}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {volumeOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setVolume(opt.level)}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  volume === opt.level
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {opt.level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-300 font-medium">
            {volumeOptions.find((o) => o.level === volume)?.desc}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
              2. 수위 / 음탕·천박 서술 조절기 (1.25배 증폭)
            </span>
            <span className="text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-950/80 px-2 py-0.5 rounded">
              {sensual}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {sensualOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setSensual(opt.level)}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  sensual === opt.level
                    ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {opt.level}
              </button>
            ))}
          </div>
          <p className={`text-[11px] font-medium leading-relaxed ${
            sensual === '200%' || sensual === '175%' ? 'text-fuchsia-300 font-bold' : 'text-fuchsia-200'
          }`}>
            {sensualOptions.find((o) => o.level === sensual)?.desc}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            글자수: <strong className="text-white ml-0.5">{wordCount.toLocaleString()}</strong>자
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            예상 독서시간: <strong className="text-white ml-0.5">{estimatedReadTime}</strong>분
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-700 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            title="현재 본문 내용과 제목을 그대로 저장"
          >
            {saveToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{saveToast ? '저장 완료!' : '본문 직접 저장하기'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? `${currentPartNumber}부 지침 반영 및 상상 구분 집필 중...` : '본문 및 제목 AI 생성하기'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <span className="text-xs font-semibold text-zinc-300">
            [에디터 본문] - 상상 파트는 &lt;imagination&gt;상상 내용&lt;/imagination&gt;으로 구분됩니다.
          </span>
          {/* ★ Step 4로 확실한 동기화와 함께 이동 */}
          <button
            type="button"
            onClick={handleGoToStep4}
            className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4 flex items-center gap-1.5 cursor-pointer font-bold bg-violet-950/60 px-3 py-1 rounded-lg border border-violet-800/70 hover:bg-violet-900/60 transition-all"
          >
            <span>이 본문으로 Step 4 에디터 이동</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <textarea
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="본문 AI 생성하기 버튼을 누르거나, 여기에 직접 소설을 집필 및 수정하세요... (저자의 상상 내용은 <imagination>...</imagination> 태그로 감싸면 Step 6 뷰어에서 특수 카드로 표기됩니다)"
          className="w-full bg-transparent border-0 text-sm text-zinc-200 leading-relaxed font-serif placeholder-zinc-700 focus:outline-none resize-y selection:bg-violet-600 selection:text-white"
        />
      </div>
    </div>
  );
};
