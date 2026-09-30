import React from 'react';
import { WorldbuildingState } from '../types';
import { Sparkles, ShieldCheck, Heart, UserCheck, Flame, BookText, Tag } from 'lucide-react';
import { INITIAL_WORLDBUILDING } from '../constants';

interface Step1Props {
  world: WorldbuildingState;
  onChange: (updated: WorldbuildingState) => void;
}

export const Step1Worldbuilding: React.FC<Step1Props> = ({ world, onChange }) => {
  const updateField = (field: keyof WorldbuildingState, value: any) => {
    onChange({
      ...world,
      [field]: value,
    });
  };

  const updateLead = (lead: 'maleLead' | 'femaleLead', key: string, value: string) => {
    onChange({
      ...world,
      [lead]: {
        ...world[lead],
        [key]: value,
      },
    });
  };

  const handleResetToPreset = () => {
    if (confirm('기본 사제지간/연상연하/개신교회 배덕 조교물 프리셋으로 설정을 초기화하시겠습니까?')) {
      onChange(INITIAL_WORLDBUILDING);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Banner */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 1
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">메타 설정 & 세계관 구축 (Worldbuilding)</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            소설의 뼈대가 되는 장르 클리셰, 인물 프로필, 문체, 시점과 성적 텐션의 지향점을 확립합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToPreset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-700 bg-violet-900/40 hover:bg-violet-800/60 text-xs text-violet-200 transition-colors cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>기본 고수위 프리셋 복원</span>
        </button>
      </div>

      {/* Preset Tags Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
          <Tag className="w-3.5 h-3.5 text-violet-400" />
          핵심 장르 클리셰 & 태그
        </label>
        <div className="flex flex-wrap gap-2">
          {world.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-violet-300 border border-violet-900/60 flex items-center gap-1"
            >
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-zinc-500 mt-2">
          * 사제지간(Teacher-Student), 연상녀연하남(Noona Romance), 개신교회(Church Romance), 메조히스트 여성, 조교물(Conditioning)
        </p>
      </div>

      {/* Title & Basic Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            소설 제목 (Title)
          </label>
          <input
            type="text"
            value={world.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            주요 타겟 독자층
          </label>
          <input
            type="text"
            value={world.targetAudience}
            onChange={(e) => updateField('targetAudience', e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Character Profiles (Male Lead & Female Lead) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Male Lead */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-violet-400" />
              남성 주인공 (Male Lead) - 도미넌트
            </h3>
            <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">지배자 / 훈육자</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">이름</label>
              <input
                type="text"
                value={world.maleLead.name}
                onChange={(e) => updateLead('maleLead', 'name', e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">나이 및 역할</label>
              <input
                type="text"
                value={`${world.maleLead.age} / ${world.maleLead.role}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  updateLead('maleLead', 'age', parts[0] || '');
                  if (parts[1]) updateLead('maleLead', 'role', parts[1].trim());
                }}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">외모 및 체격 특성</label>
            <input
              type="text"
              value={world.maleLead.appearance}
              onChange={(e) => updateLead('maleLead', 'appearance', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">표면적 성격 및 이면의 지배 성향</label>
            <textarea
              rows={2}
              value={world.maleLead.personality}
              onChange={(e) => updateLead('maleLead', 'personality', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">비밀 특성 & 훈육 방식</label>
            <textarea
              rows={2}
              value={world.maleLead.hiddenTrait}
              onChange={(e) => updateLead('maleLead', 'hiddenTrait', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>
        </div>

        {/* Female Lead */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-sm font-bold text-fuchsia-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-fuchsia-400" />
              여성 주인공 (Female Lead) - 서브미시브
            </h3>
            <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">피지배자 / 피학 성향</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">이름</label>
              <input
                type="text"
                value={world.femaleLead.name}
                onChange={(e) => updateLead('femaleLead', 'name', e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">나이 및 역할</label>
              <input
                type="text"
                value={`${world.femaleLead.age} / ${world.femaleLead.role}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  updateLead('femaleLead', 'age', parts[0] || '');
                  if (parts[1]) updateLead('femaleLead', 'role', parts[1].trim());
                }}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">외모 및 신체적 분위기</label>
            <input
              type="text"
              value={world.femaleLead.appearance}
              onChange={(e) => updateLead('femaleLead', 'appearance', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">사회적 모습 및 내면의 갈등</label>
            <textarea
              rows={2}
              value={world.femaleLead.personality}
              onChange={(e) => updateLead('femaleLead', 'personality', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">은밀한 피학 욕망 & 굴복의 계기</label>
            <textarea
              rows={2}
              value={world.femaleLead.secretDesire}
              onChange={(e) => updateLead('femaleLead', 'secretDesire', e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Supporting Characters & Tone Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            보조 인물 및 관계망
          </label>
          <textarea
            rows={3}
            value={world.supportingCast}
            onChange={(e) => updateField('supportingCast', e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white leading-relaxed"
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            문체 및 연출 특성 (Tone & Style)
          </label>
          <textarea
            rows={3}
            value={world.toneStyle}
            onChange={(e) => updateField('toneStyle', e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white leading-relaxed"
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              사건 시점 (POV)
            </label>
            <input
              type="text"
              value={world.pov}
              onChange={(e) => updateField('pov', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              작성 시제 (Tense)
            </label>
            <input
              type="text"
              value={world.tense}
              onChange={(e) => updateField('tense', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
