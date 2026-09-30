import React, { useState } from 'react';
import { NovelSettings, Episode } from '../types';
import { 
  Sparkles, Wand2, Sliders, ArrowRight, ArrowLeft, 
  Check, Copy, BookOpen, Flame, FileText, Info, ShieldAlert,
  User, Compass, BookmarkCheck
} from 'lucide-react';
import { draftEpisodeContentAI, MultiplierLevel } from '../services/geminiService';

interface Step3WritingProps {
  settings: NovelSettings;
  episodes: Episode[];
  onChangeEpisodes: (episodes: Episode[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MULTIPLIER_OPTIONS: MultiplierLevel[] = [100, 125, 150, 175, 200];

export const Step3Writing: React.FC<Step3WritingProps> = ({
  settings,
  episodes,
  onChangeEpisodes,
  onNext,
  onPrev,
}) => {
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [lengthMultiplier, setLengthMultiplier] = useState<MultiplierLevel>(100);
  const [intensityLevel, setIntensityLevel] = useState<MultiplierLevel>(100);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettingsSpec, setShowSettingsSpec] = useState(true);

  const activeEpisode = episodes.find(e => e.id === selectedEpId) || episodes[0];

  const handleUpdateContent = (text: string) => {
    if (!activeEpisode) return;
    onChangeEpisodes(
      episodes.map(e => e.id === activeEpisode.id ? { ...e, content: text } : e)
    );
  };

  const handleDraftWithAi = async () => {
    if (!activeEpisode) return;
    setIsDrafting(true);

    const activeIndex = episodes.findIndex(e => e.id === activeEpisode.id);
    const prevEpSnippet = activeIndex > 0 ? episodes[activeIndex - 1].content.slice(-400) : undefined;

    try {
      const generated = await draftEpisodeContentAI(
        activeEpisode,
        settings,
        lengthMultiplier,
        intensityLevel,
        prevEpSnippet
      );
      handleUpdateContent(generated);
    } catch (err) {
      alert('소설 본문 집필 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    if (!activeEpisode?.content) return;
    navigator.clipboard.writeText(activeEpisode.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = activeEpisode?.content?.length || 0;

  const getIntensityDescription = (level: MultiplierLevel) => {
    switch (level) {
      case 100:
        return '기본 100%: 은밀한 긴장감, 심리적 배덕감, 낮게 깔리는 차가운 명령과 첫 규칙 부여';
      case 125:
        return '125%: 노골적인 수치심 유발, 거친 언어적 훈육, 스승과 제자의 위계가 뒤흔들리는 체벌';
      case 150:
        return '150%: 음탕하고 직설적인 복종 서술, 전도사의 단정한 가면 아래 숨겨진 메조히즘 굴복';
      case 175:
        return '175%: 성역 속 극단적 배덕감, 원색적인 육체적 체벌과 천박한 훈육 대사 폭발';
      case 200:
        return '최고 수위 200%: 가식과 위선을 완전히 찢어발기는 극도의 음탕함과 파멸적 타락의 절정';
    }
  };

  const getLengthDescription = (level: MultiplierLevel) => {
    switch (level) {
      case 100:
        return '100% (기본 약 2,000자 내외)';
      case 125:
        return '125% (풍성 약 2,600자 내외)';
      case 150:
        return '150% (대용량 약 3,500자 내외)';
      case 175:
        return '175% (초고용량 약 4,500자 내외)';
      case 200:
        return '200% (극대용량 약 5,500자 이상)';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 p-6 rounded-2xl border border-rose-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                3단계
              </span>
              <h1 className="text-xl font-bold text-white">에피소드 본문 정밀 집필</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-emerald-400">1단계 기획 명세서(남·여주인공, 시점, 문체, 시제)</strong>를 엄격히 준수하여 수위(100%~200%)와 분량(100%~200%)을 정밀 제어 집필합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-rose-400 font-bold">수위 {intensityLevel}%</span>
            <span className="text-slate-600">|</span>
            <span className="text-brand-400 font-bold">분량 {lengthMultiplier}%</span>
          </div>
        </div>

        {/* 1st Step Compliance Assurance Tag */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-300">
          <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
            <BookmarkCheck className="w-3.5 h-3.5" />
            1단계 기획 실시간 연동:
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            시점: <strong className="text-white">{settings.storyPov}</strong>
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            시제: <strong className="text-white">{settings.narrativeTense}</strong>
          </span>
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300 line-clamp-1 max-w-[220px]">
            문체: {settings.writingStyle}
          </span>
          <button
            onClick={() => setShowSettingsSpec(!showSettingsSpec)}
            className="text-[10px] text-brand-400 hover:underline ml-auto font-bold"
          >
            {showSettingsSpec ? '기획 명세 닫기' : '1단계 명세 보기'}
          </button>
        </div>

        {/* Expandable 1st-Step Spec Card */}
        {showSettingsSpec && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-blue-400 font-bold block mb-0.5">• 남주인공 (1단계 설정):</span>
              <p className="text-slate-400 line-clamp-2">{settings.maleLead}</p>
            </div>
            <div>
              <span className="text-pink-400 font-bold block mb-0.5">• 여주인공 (1단계 설정):</span>
              <p className="text-slate-400 line-clamp-2">{settings.femaleLead}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-amber-400 font-bold block mb-0.5">• 핵심 시놉시스 & 복선:</span>
              <p className="text-slate-400 line-clamp-2">{settings.synopsis}</p>
            </div>
          </div>
        )}

        {/* Dual Controller: Intensity & Length */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Intensity Slider Controller */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                묘사 수위 설정 (음탕하고 천박한 서술)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {intensityLevel}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {MULTIPLIER_OPTIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setIntensityLevel(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    intensityLevel === val
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              {getIntensityDescription(intensityLevel)}
            </p>
          </div>

          {/* Length Slider Controller */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-brand-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-400" />
                집필 분량 설정 (원고 글자수 확장)
              </span>
              <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {lengthMultiplier}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {MULTIPLIER_OPTIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLengthMultiplier(val)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    lengthMultiplier === val
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              {getLengthDescription(lengthMultiplier)}
            </p>
          </div>
        </div>
      </div>

      {/* Episode Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {episodes.map((ep, idx) => (
          <button
            key={ep.id}
            onClick={() => setSelectedEpId(ep.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-2 border ${
              activeEpisode?.id === ep.id
                ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
              {idx + 1}
            </span>
            <span className="max-w-[120px] truncate">{ep.title.replace(/^제\d+화\.\s*/, '')}</span>
            {ep.content ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="작성 완료" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-600" title="미작성" />
            )}
          </button>
        ))}
      </div>

      {/* Editor & Context Box */}
      {activeEpisode && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Context Info (1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>플롯 얼개 요약</span>
              </h3>
              <div>
                <span className="text-[10px] text-brand-400 font-mono block">{activeEpisode.stageTitle}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeEpisode.title}</h4>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block mb-1">줄거리 요약:</span>
                {activeEpisode.summary}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-rose-400 block mb-1">핵심 갈등 & 배덕감:</span>
                {activeEpisode.conflict}
              </div>

              {/* Status Indicator */}
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>선택 수위:</span>
                  <span className="text-rose-400 font-bold">{intensityLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span>선택 분량:</span>
                  <span className="text-brand-400 font-bold">{lengthMultiplier}%</span>
                </div>
              </div>

              {/* AI Draft Button */}
              <button
                onClick={handleDraftWithAi}
                disabled={isDrafting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 text-xs transition"
              >
                <Wand2 className={`w-4 h-4 ${isDrafting ? 'animate-spin' : ''}`} />
                <span>
                  {isDrafting 
                    ? '1단계 준수 집필 중...' 
                    : `수위 ${intensityLevel}% / 분량 ${lengthMultiplier}% 집필하기`}
                </span>
              </button>
            </div>
          </div>

          {/* Main Novel Manuscript Editor (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>원고 작성창 (마우스로 드래그하면 4단계에서 부분 수정 가능)</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-300">
                  공백 포함: <strong className="text-brand-400">{wordCount.toLocaleString()}</strong>자
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? '복사됨!' : '본문 복사'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={22}
              value={activeEpisode.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
              placeholder="여기에 소설 본문을 직접 작성하거나, 좌측 [수위 및 분량 설정 후 AI로 집필하기] 버튼을 눌러보세요..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm md:text-base leading-loose font-serif text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500/60 shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
        >
          이전: 2단계 플롯 수정
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <span>4단계: AI 부분 문장 퇴고로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
