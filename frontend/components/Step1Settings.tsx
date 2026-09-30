import React, { useState } from 'react';
import { NovelSettings } from '../types';
import { Sparkles, Wand2, Plus, X, BookOpen, Users, Compass, Eye, HeartHandshake } from 'lucide-react';
import { generateNovelSettingsAI } from '../services/geminiService';

interface Step1SettingsProps {
  settings: NovelSettings;
  onChange: (settings: NovelSettings) => void;
  onNext: () => void;
}

export const Step1Settings: React.FC<Step1SettingsProps> = ({ settings, onChange, onNext }) => {
  const [newTag, setNewTag] = useState('');
  const [aiThemeHint, setAiThemeHint] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleFieldChange = (field: keyof NovelSettings, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim().replace(/^#/, '');
    if (trimmed && !settings.tags.includes(trimmed)) {
      handleFieldChange('tags', [...settings.tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleFieldChange('tags', settings.tags.filter(t => t !== tagToRemove));
  };

  const handleAutoGenerateAI = async () => {
    setLoadingAi(true);
    try {
      const generated = await generateNovelSettingsAI(aiThemeHint);
      onChange({
        ...settings,
        ...generated
      });
    } catch (err) {
      alert('AI 설정 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                1단계
              </span>
              <h1 className="text-xl font-bold text-white">소설 세계관 & 디테일 기획</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              작품의 제목, 키워드 태그, 주인공과 조연, 특유의 문체, 사건 및 작성 시점, 타깃 독자층을 정밀하게 정의합니다.
            </p>
          </div>

          {/* Quick AI Generator Box */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700/80">
            <input
              type="text"
              value={aiThemeHint}
              onChange={(e) => setAiThemeHint(e.target.value)}
              placeholder="예: 현대 헌터 레이드, 빙의 영지물..."
              className="bg-slate-950 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 w-48 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAutoGenerateAI}
              disabled={loadingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              <Wand2 className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? '생성 중...' : 'AI 설정 자동채우기'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title & Genre */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
            <BookOpen className="w-4 h-4" />
            <span>기본 타이틀 및 장르</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">소설 제목</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="예: 천재 마도사의 영지 생존기"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">세부 장르 분류</label>
            <input
              type="text"
              value={settings.genre}
              onChange={(e) => handleFieldChange('genre', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="예: 퓨전 판타지 / 영지물 / 상태창"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">소설 핵심 키워드 태그</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {settings.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="태그 입력 후 Enter"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        {/* Narrative Style & POV */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
            <Compass className="w-4 h-4" />
            <span>문체 및 서술 시점</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">문체 (스타일, 리듬, 호흡)</label>
            <textarea
              rows={2}
              value={settings.writingStyle}
              onChange={(e) => handleFieldChange('writingStyle', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="예: 빠른 템포의 간결체, 티키타카 중심, 감정 묘사는 절제하고 액션 감각 극대화"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">사건 시점 (Point of View)</label>
              <input
                type="text"
                value={settings.storyPov}
                onChange={(e) => handleFieldChange('storyPov', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="예: 1인칭 주인공 시점"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">작성 시점 (시제/종결어미)</label>
              <input
                type="text"
                value={settings.narrativeTense}
                onChange={(e) => handleFieldChange('narrativeTense', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="예: 현재형 혼용 과거형"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">염두에 둔 타깃 독자층</label>
            <input
              type="text"
              value={settings.targetAudience}
              onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="예: 20~30대 직장인, 피로감 없이 시원한 사이다와 츤데레 케미를 원하는 층"
            />
          </div>
        </div>

        {/* Characters (Male, Female, Supporting) */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
            <Users className="w-4 h-4" />
            <span>등장인물 심층 프로필</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-blue-400 mb-1">남주인공 (외모, 성격, 결핍, 치명적 매력)</label>
              <textarea
                rows={3}
                value={settings.maleLead}
                onChange={(e) => handleFieldChange('maleLead', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="이름, 나이, 특성, 핵심 목표 및 능력..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-pink-400 mb-1">여주인공 (성격, 남주와의 관계성, 티키타카 포인트)</label>
              <textarea
                rows={3}
                value={settings.femaleLead}
                onChange={(e) => handleFieldChange('femaleLead', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                placeholder="이름, 나이, 직위, 남주와의 케미스트리..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">보조 인물들 (스승, 충직한 부하, 라이벌, 마스코트 등)</label>
            <textarea
              rows={2}
              value={settings.supportingChars}
              onChange={(e) => handleFieldChange('supportingChars', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="예: 총괄 집사 오스칼(현실주의자), 보디가드 볼코프(도예 좋아하는 거인)..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">작품 핵심 시놉시스 (도입 - 발단 - 핵심 재미 요소)</label>
            <textarea
              rows={3}
              value={settings.synopsis}
              onChange={(e) => handleFieldChange('synopsis', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="전체적인 줄거리와 독자를 끌어당길 관람 포인트..."
            />
          </div>
        </div>
      </div>

      {/* Footer Next Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95"
        >
          <span>2단계: 영웅의 여정 플롯 구성으로 이동</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
