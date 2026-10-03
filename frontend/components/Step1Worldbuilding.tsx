import React, { useState } from 'react';
import { WorldbuildingState, SupportingCharacter, Step1Section, ArchetypeRole, NovelPart } from '../types';
import { ARCHETYPE_DESCRIPTIONS } from '../constants';
import { generateRecommendedTagsAI } from '../services/geminiService';
import {
  Sparkles,
  Heart,
  UserCheck,
  Flame,
  Tag,
  Users,
  Clock,
  Calendar,
  Plus,
  Trash2,
  BookText,
  X,
  Target,
  Palette,
  MessageSquare,
  Info,
  MapPin,
  Layers,
  Hourglass,
  Check,
  Shield,
  HelpCircle,
  Eye,
  Bell,
  Ghost,
  Swords,
  Crown,
  Wand2,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { INITIAL_WORLDBUILDING } from '../constants';

interface Step1Props {
  world: WorldbuildingState;
  onChange: (updated: WorldbuildingState) => void;
  highlightedSections?: Step1Section[];
}

export const Step1Worldbuilding: React.FC<Step1Props> = ({
  world,
  onChange,
  highlightedSections = [],
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAutoGeneratingTags, setIsAutoGeneratingTags] = useState(false);
  const [tagToast, setTagToast] = useState(false);

  const [newSupp, setNewSupp] = useState<Partial<SupportingCharacter>>({
    name: '',
    archetype: '문턱 수호자',
    role: '',
    relationship: '',
    notes: '',
    appearingParts: [1],
  });
  const [isAddingSupp, setIsAddingSupp] = useState(false);

  const [newPartTitle, setNewPartTitle] = useState('');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartHiatus, setNewPartHiatus] = useState('3개월');
  const [confirmingPartNum, setConfirmingPartNum] = useState<number | null>(null);

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

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (tag && !world.tags.includes(tag)) {
      onChange({
        ...world,
        tags: [...world.tags, tag],
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...world,
      tags: world.tags.filter((t) => t !== tagToRemove),
    });
  };

  // ★ 사용자 요청 기능: Step 1의 [남주], [여주], [보조인물], [스타일]을 참조하여 태그를 AI로 <자동추가>
  const handleAutoAddTags = async () => {
    if (isAutoGeneratingTags) return;
    setIsAutoGeneratingTags(true);

    try {
      const recommendedTags = await generateRecommendedTagsAI(world);
      const uniqueNewTags = recommendedTags.filter(t => !world.tags.includes(t));

      if (uniqueNewTags.length > 0) {
        onChange({
          ...world,
          tags: [...world.tags, ...uniqueNewTags]
        });
        setTagToast(true);
        setTimeout(() => setTagToast(false), 2500);
      } else {
        alert('추천된 태그가 이미 모두 등록되어 있습니다.');
      }
    } catch (err) {
      console.error('Failed to auto generate tags', err);
    } finally {
      setIsAutoGeneratingTags(false);
    }
  };

  const handleAddPart = () => {
    const nextPartNumber = (world.parts?.length || 0) + 1;
    const createdPart: NovelPart = {
      partNumber: nextPartNumber,
      title: newPartTitle.trim() || `${nextPartNumber}부: 새로운 장`,
      description: newPartDesc.trim() || `${nextPartNumber}부의 주된 갈등과 서사`,
      hiatusDuration: nextPartNumber > 1 ? (newPartHiatus.trim() || '3개월') : undefined
    };

    onChange({
      ...world,
      parts: [...(world.parts || []), createdPart]
    });

    setNewPartTitle('');
    setNewPartDesc('');
    setNewPartHiatus('3개월');
  };

  const handleExecuteDeletePart = (partNum: number) => {
    const currentParts = world.parts || [];
    if (currentParts.length <= 1) {
      alert('소설은 최소 1개의 부(1부)가 유지되어야 합니다.');
      setConfirmingPartNum(null);
      return;
    }

    const updated = currentParts
      .filter((p) => p.partNumber !== partNum)
      .map((p, idx) => ({ ...p, partNumber: idx + 1 }));

    onChange({
      ...world,
      parts: updated,
    });
    setConfirmingPartNum(null);
  };

  const handleAddSupporting = () => {
    if (!newSupp.name?.trim()) return;

    const created: SupportingCharacter = {
      id: `supp-${Date.now()}`,
      name: newSupp.name.trim(),
      archetype: (newSupp.archetype as ArchetypeRole) || '문턱 수호자',
      role: newSupp.role?.trim() || '보조 인물',
      relationship: newSupp.relationship?.trim() || '관계 미상',
      notes: newSupp.notes?.trim() || '',
      appearingParts: newSupp.appearingParts && newSupp.appearingParts.length > 0 ? newSupp.appearingParts : [1],
    };

    onChange({
      ...world,
      supportingCharacters: [...world.supportingCharacters, created],
    });

    setNewSupp({ name: '', archetype: '문턱 수호자', role: '', relationship: '', notes: '', appearingParts: [1] });
    setIsAddingSupp(false);
  };

  const handleRemoveSupporting = (id: string) => {
    onChange({
      ...world,
      supportingCharacters: world.supportingCharacters.filter((s) => s.id !== id),
    });
  };

  const handleUpdateSupporting = (id: string, key: keyof SupportingCharacter, value: any) => {
    onChange({
      ...world,
      supportingCharacters: world.supportingCharacters.map((s) =>
        s.id === id ? { ...s, [key]: value } : s
      ),
    });
  };

  const handleTogglePartForSupp = (suppId: string, partNum: number) => {
    const target = world.supportingCharacters.find(s => s.id === suppId);
    if (!target) return;
    const curParts = target.appearingParts || [1];
    const newParts = curParts.includes(partNum)
      ? curParts.filter(p => p !== partNum)
      : [...curParts, partNum];

    handleUpdateSupporting(suppId, 'appearingParts', newParts.length > 0 ? newParts : [1]);
  };

  const handleResetToPreset = () => {
    onChange(INITIAL_WORLDBUILDING);
  };

  const isHighlighted = (sec: Step1Section) => highlightedSections.includes(sec);

  const archetypeList: ArchetypeRole[] = [
    '영웅',
    '조력자',
    '문턱 수호자',
    '전령',
    '변신자',
    '그림자',
    '책략가'
  ];

  const getArchetypeIcon = (arc: ArchetypeRole) => {
    switch (arc) {
      case '영웅': return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case '조력자': return <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case '문턱 수호자': return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case '전령': return <Bell className="w-3.5 h-3.5 text-yellow-400" />;
      case '변신자': return <Eye className="w-3.5 h-3.5 text-purple-400" />;
      case '그림자': return <Ghost className="w-3.5 h-3.5 text-rose-400" />;
      case '책략가': return <Swords className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Users className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Step 1 Overview Banner */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-600 text-white">
              Step 1
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              메타 설정 & 세계관 구축
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            소설 제목과 5대 태그, <strong>주요 무대</strong>, <strong>1부/2부/3부 확장 및 부간 휴재 간극</strong>, <strong>영웅의 여정 7대 원형 보조인물</strong>을 관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToPreset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-700 bg-violet-900/40 hover:bg-violet-800/60 text-xs text-violet-200 transition-colors cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>기본 설정 프리셋 복원</span>
        </button>
      </div>

      {/* SECTION 1: 소설 제목 & 태그 & 주요 타겟 독자층 */}
      <section
        className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${
          isHighlighted('META_BASIC')
            ? 'border-violet-500 bg-violet-950/30 ring-2 ring-violet-500/50'
            : 'border-zinc-800 bg-zinc-900/60'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/30">
              ①
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <BookText className="w-4 h-4 text-violet-400" />
              소설 제목 & 태그 & 주요 타겟 독자층
            </h3>
          </div>
          <span className="text-[11px] text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60 font-mono">
            [소설제목&태그&주요타겟독자층]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              소설 제목 (Title)
            </label>
            <input
              type="text"
              value={world.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white font-bold focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              주요 타겟 독자층 (Step 3 본문 집필 시 말을 건네는 대상)
            </label>
            <input
              type="text"
              value={world.targetAudience}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              placeholder="예: 20-30대 고수위 피폐·배덕 로맨스 독자층"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Tag Management with <자동추가> button */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>소설 장르 및 키워드 태그 (Step 3 본문 집필과 Step 5 댓글에 자동 반영)</span>
            </label>

            {/* ★ 사용자 요청: Step1 [남주], [여주], [보조인물], [스타일] 참조 <자동추가> 버튼 */}
            <div className="flex items-center gap-2">
              {tagToast && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" /> 새 키워드 추가됨!
                </span>
              )}
              <button
                type="button"
                onClick={handleAutoAddTags}
                disabled={isAutoGeneratingTags}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-950/40 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                title="남성주인공, 여성주인공, 보조인물, 스타일 설정을 참조하여 추천 태그를 자동 생성"
              >
                {isAutoGeneratingTags ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>&lt;자동추가&gt; (남주·여주·보조인물·스타일 참조)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {world.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-950/80 text-violet-200 border border-violet-800 group transition-all"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="w-3.5 h-3.5 rounded-full hover:bg-violet-800 flex items-center justify-center text-violet-300 hover:text-white transition-colors cursor-pointer ml-0.5"
                  title="태그 삭제"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex gap-2 max-w-md pt-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="새 태그 직접 입력 (엔터)"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newTagInput.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              직접 추가
            </button>
          </form>
        </div>
      </section>

      {/* SECTION: 소설 부(Part) 확장 및 부간 간극 설정 */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              구조
            </span>
            <div>
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                소설 부(Part) 확장 및 부간 간극 설정 (Step 5 독자 반응에 직결)
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                n부와 n-1부 사이의 기다림 기간(예: 3개월)을 설정하면, 독자 댓글 시뮬레이션에서 <strong>"3개월 동안 손꼽아 기다렸다"</strong>는 갈증과 감탄이 자연스럽게 연출됩니다.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            현재 {(world.parts || []).length}개 부 운용 중
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(world.parts || []).map((part) => {
            const isDeletingThis = confirmingPartNum === part.partNumber;

            return (
              <div
                key={part.partNumber}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2.5 relative hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                    {part.partNumber}부
                  </span>

                  {(world.parts || []).length > 1 && (
                    <div>
                      {isDeletingThis ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleExecuteDeletePart(part.partNumber)}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            삭제 확정
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingPartNum(null)}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white text-[10px] cursor-pointer"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingPartNum(part.partNumber)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer transition-colors"
                          title="해당 부 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">부 제목</label>
                  <input
                    type="text"
                    value={part.title}
                    onChange={(e) => {
                      const updated = (world.parts || []).map(p => p.partNumber === part.partNumber ? { ...p, title: e.target.value } : p);
                      updateField('parts', updated);
                    }}
                    className="w-full text-xs font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {part.partNumber > 1 && (
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Hourglass className="w-3 h-3 text-amber-400" />
                      {part.partNumber - 1}부 종료 후 대기/휴재 간극:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={part.hiatusDuration || '3개월'}
                        onChange={(e) => {
                          const updated = (world.parts || []).map(p => p.partNumber === part.partNumber ? { ...p, hiatusDuration: e.target.value } : p);
                          updateField('parts', updated);
                        }}
                        placeholder="예: 3개월, 6개월, 1년"
                        className="w-24 bg-zinc-950 text-xs text-amber-200 font-bold px-2 py-0.5 rounded border border-zinc-700 focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-400">동안 독자 대기</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">서사 개요</label>
                  <textarea
                    rows={2}
                    value={part.description}
                    onChange={(e) => {
                      const updated = (world.parts || []).map(p => p.partNumber === part.partNumber ? { ...p, description: e.target.value } : p);
                      updateField('parts', updated);
                    }}
                    placeholder="해당 부의 주요 갈등과 서사 전개 요약..."
                    className="w-full text-[11px] text-zinc-300 bg-zinc-900 p-1.5 rounded border border-zinc-800 resize-none focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 space-y-2.5">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> {(world.parts || []).length + 1}부 확장하기
            </span>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-0.5">부 제목</label>
              <input
                type="text"
                placeholder={`예: ${(world.parts || []).length + 1}부: 새로운 장`}
                value={newPartTitle}
                onChange={(e) => setNewPartTitle(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-amber-300 mb-0.5">
                {(world.parts || []).length}부 종료 후 대기 간극 (휴재 기간)
              </label>
              <input
                type="text"
                placeholder="예: 3개월"
                value={newPartHiatus}
                onChange={(e) => setNewPartHiatus(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-amber-200 font-bold"
              />
            </div>

            <button
              type="button"
              onClick={handleAddPart}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md"
            >
              + {(world.parts || []).length + 1}부 추가 (Stage 1~16 생성)
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: 남성 주인공 & 여성 주인공 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${
            isHighlighted('MALE_LEAD')
              ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/50'
              : 'border-zinc-800 bg-zinc-900/60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                ②
              </span>
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                남성 주인공 (최창환)
              </h3>
            </div>
            <span className="text-[11px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 font-mono">
              [남성주인공]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">이름</label>
              <input
                type="text"
                placeholder="예: 최창환"
                value={world.maleLead.name}
                onChange={(e) => updateLead('maleLead', 'name', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">나이 및 역할</label>
              <input
                type="text"
                placeholder="예: 24세 / 청년부 사역자"
                value={`${world.maleLead.age}${world.maleLead.role ? ` / ${world.maleLead.role}` : ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  updateLead('maleLead', 'age', parts[0]?.trim() || '');
                  if (parts[1]) updateLead('maleLead', 'role', parts[1].trim());
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-indigo-900/50 bg-indigo-950/30 space-y-1">
            <label className="block text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              남성 주인공 말투 및 대사 어투 (Speech Style)
            </label>
            <textarea
              rows={2}
              value={world.maleLead.speechStyle || ''}
              onChange={(e) => updateLead('maleLead', 'speechStyle', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">외모 및 체격 특성</label>
            <input
              type="text"
              value={world.maleLead.appearance}
              onChange={(e) => updateLead('maleLead', 'appearance', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">성격 및 지배 성향</label>
            <textarea
              rows={3}
              value={world.maleLead.personality}
              onChange={(e) => updateLead('maleLead', 'personality', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>
        </section>

        {/* 여성 주인공 */}
        <section
          className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${
            isHighlighted('FEMALE_LEAD')
              ? 'border-fuchsia-500 bg-fuchsia-950/30 ring-2 ring-fuchsia-500/50'
              : 'border-zinc-800 bg-zinc-900/60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center font-bold text-xs border border-fuchsia-500/30">
                ③
              </span>
              <h3 className="text-sm font-bold text-fuchsia-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-fuchsia-400" />
                여성 주인공 (손세미)
              </h3>
            </div>
            <span className="text-[11px] text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800/60 font-mono">
              [여성주인공]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">이름</label>
              <input
                type="text"
                value={world.femaleLead.name}
                onChange={(e) => updateLead('femaleLead', 'name', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">나이 및 역할</label>
              <input
                type="text"
                value={`${world.femaleLead.age}${world.femaleLead.role ? ` / ${world.femaleLead.role}` : ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  updateLead('femaleLead', 'age', parts[0]?.trim() || '');
                  if (parts[1]) updateLead('femaleLead', 'role', parts[1].trim());
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-fuchsia-900/50 bg-fuchsia-950/30 space-y-1">
            <label className="block text-[11px] font-bold text-fuchsia-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
              여성 주인공 말투 및 대사 어투 (Speech Style)
            </label>
            <textarea
              rows={2}
              value={world.femaleLead.speechStyle || ''}
              onChange={(e) => updateLead('femaleLead', 'speechStyle', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed focus:border-fuchsia-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">외모 및 신체적 분위기</label>
            <input
              type="text"
              value={world.femaleLead.appearance}
              onChange={(e) => updateLead('femaleLead', 'appearance', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">사회적 모습 및 피학적 내면</label>
            <textarea
              rows={3}
              value={world.femaleLead.personality}
              onChange={(e) => updateLead('femaleLead', 'personality', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white leading-relaxed"
            />
          </div>
        </section>
      </div>

      {/* SECTION 4: 보조 인물 시스템 (영웅의 여정 7대 원형 및 역할 수정 기능 완전 구비) */}
      <section
        className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${
          isHighlighted('SUPPORTING_CAST')
            ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50'
            : 'border-zinc-800 bg-zinc-900/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              ④
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                영웅의 여정 7대 원형 보조 인물 시스템
              </h3>
              <p className="text-[11px] text-zinc-400">
                인물의 <strong>원형(Archetype)과 작중 직책/역할(Role), 관계를 자유롭게 수정</strong>하여 서사의 긴장감을 조율합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
              [보조인물] ({world.supportingCharacters.length}명)
            </span>
            <button
              type="button"
              onClick={() => setIsAddingSupp(!isAddingSupp)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              보조 인물 직접 추가
            </button>
          </div>
        </div>

        {/* 7대 원형 가이드 */}
        <div className="rounded-xl border border-emerald-900/50 bg-zinc-950/90 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>[영웅의 여정 7대 원형] 역할별 상세 가이드 (보조인물 생성 시 참고):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
            {archetypeList.map((arc) => {
              const info = ARCHETYPE_DESCRIPTIONS[arc];
              return (
                <div key={arc} className="rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    {getArchetypeIcon(arc)}
                    <span>{arc}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">({info.name.split('(')[1]?.replace(')', '') || ''})</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-snug">{info.desc}</p>
                  <p className="text-[10px] text-emerald-400/90 font-medium">서사 역할: {info.narrativeRole}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 새 보조 인물 생성 폼 */}
        {isAddingSupp && (
          <div className="rounded-xl border border-emerald-600/50 bg-zinc-950 p-4 space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 새로운 원형 보조 인물 카드 생성
              </span>
              <button
                type="button"
                onClick={() => setIsAddingSupp(false)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">인물 이름</label>
                <input
                  type="text"
                  placeholder="예: 박진철 목사"
                  value={newSupp.name}
                  onChange={(e) => setNewSupp({ ...newSupp, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">영웅의 여정 7대 원형</label>
                <select
                  value={newSupp.archetype}
                  onChange={(e) => setNewSupp({ ...newSupp, archetype: e.target.value as ArchetypeRole })}
                  className="w-full rounded-lg border border-emerald-600 bg-zinc-900 px-2 py-1.5 text-xs text-emerald-300 font-bold"
                >
                  {archetypeList.map((arc) => (
                    <option key={arc} value={arc}>
                      {arc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">작중 직책/역할</label>
                <input
                  type="text"
                  placeholder="예: 담임목사 (50대 후반)"
                  value={newSupp.role}
                  onChange={(e) => setNewSupp({ ...newSupp, role: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">등장 부(Part) 설정</label>
                <div className="flex items-center gap-2 pt-1">
                  {(world.parts || [{ partNumber: 1, title: '1부', description: '' }]).map(p => (
                    <label key={p.partNumber} className="flex items-center gap-1 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(newSupp.appearingParts || [1]).includes(p.partNumber)}
                        onChange={(e) => {
                          const cur = newSupp.appearingParts || [1];
                          const updated = e.target.checked ? [...cur, p.partNumber] : cur.filter(x => x !== p.partNumber);
                          setNewSupp({ ...newSupp, appearingParts: updated.length > 0 ? updated : [1] });
                        }}
                        className="accent-emerald-500"
                      />
                      <span>{p.partNumber}부</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">서사 내 위기 요인 및 에피소드 상호작용</label>
              <textarea
                rows={2}
                placeholder="인물이 주인공의 밀회를 감시하거나, 의심을 품고 시험에 빠뜨리는 서사적 역할을 작성하세요..."
                value={newSupp.notes}
                onChange={(e) => setNewSupp({ ...newSupp, notes: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSupp(false)}
                className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddSupporting}
                disabled={!newSupp.name?.trim()}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
              >
                보조 인물 저장
              </button>
            </div>
          </div>
        )}

        {/* ★ 보조 인물 목록 카드: 역할/직책 및 원형 직접 수정 기능 탑재 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {world.supportingCharacters.map((supp) => (
            <div
              key={supp.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2.5 hover:border-zinc-700 transition-all relative group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{supp.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      {getArchetypeIcon(supp.archetype || '조력자')}
                      {supp.archetype || '조력자'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSupporting(supp.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="인물 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 등장 부 체크박스 UI */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                <span className="text-[11px] font-semibold text-emerald-400">등장 부:</span>
                {(world.parts || [{ partNumber: 1, title: '1부', description: '' }]).map(p => {
                  const isChecked = (supp.appearingParts || [1]).includes(p.partNumber);
                  return (
                    <button
                      key={p.partNumber}
                      type="button"
                      onClick={() => handleTogglePartForSupp(supp.id, p.partNumber)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {p.partNumber}부 {isChecked ? '✓' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs space-y-1.5 pt-1">
                {/* ★ 보조인물 작중 직책/역할(Role) 직접 수정 필드 */}
                <div>
                  <span className="text-zinc-500 font-medium">직책/역할: </span>
                  <input
                    type="text"
                    value={supp.role || ''}
                    onChange={(e) => handleUpdateSupporting(supp.id, 'role', e.target.value)}
                    placeholder="예: 담임목사, 청년부 회장 등"
                    className="bg-transparent border-0 border-b border-zinc-800 focus:border-emerald-500 text-emerald-300 font-semibold text-xs w-full focus:outline-none"
                  />
                </div>

                {/* 7대 원형 선택 수정 */}
                <div>
                  <span className="text-zinc-500 font-medium">7대 원형: </span>
                  <select
                    value={supp.archetype || '조력자'}
                    onChange={(e) => handleUpdateSupporting(supp.id, 'archetype', e.target.value as ArchetypeRole)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-300 font-bold"
                  >
                    {archetypeList.map((arc) => (
                      <option key={arc} value={arc}>{arc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-zinc-500 font-medium">관계: </span>
                  <input
                    type="text"
                    value={supp.relationship}
                    onChange={(e) => handleUpdateSupporting(supp.id, 'relationship', e.target.value)}
                    className="bg-transparent border-0 border-b border-zinc-800 focus:border-emerald-500 text-zinc-300 text-xs w-full focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">서사 내 상호작용: </span>
                  <textarea
                    rows={2}
                    value={supp.notes}
                    onChange={(e) => handleUpdateSupporting(supp.id, 'notes', e.target.value)}
                    className="bg-transparent border-0 border-b border-zinc-800 focus:border-emerald-500 text-zinc-400 text-xs w-full focus:outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: 문체·연출 & 사건 시점/연도 & 작성 시제 & 주요 무대 */}
      <section
        className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all duration-500 ${
          isHighlighted('STYLE_AND_TIME')
            ? 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/50'
            : 'border-zinc-800 bg-zinc-900/60'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              ⑤
            </span>
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              스타일 및 시점/시제 & 주요 무대 (Step 3 본문 집필 시 자동 반영)
            </h3>
          </div>
          <span className="text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-mono">
            [스타일]
          </span>
        </div>

        {/* 주요 무대 설정 */}
        <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/30 space-y-1.5">
          <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            주요 무대 (Main Setting) - 본문 공간적 배경
          </label>
          <input
            type="text"
            value={world.mainSetting || ''}
            onChange={(e) => updateField('mainSetting', e.target.value)}
            placeholder="예: 도심 외곽 주사랑 개신교회 (성가대실 피아노 앞, 인적 드문 자모실, 지하 기도실 및 사택)"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
          <span className="text-[10px] text-zinc-400">* 본문 집필 시 공간적 분위기와 밀실의 폐쇄성이 집필 프롬프트에 직접 주입됩니다.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              문체 및 연출 특성 (Tone & Style)
            </label>
            <textarea
              rows={4}
              value={world.toneStyle}
              onChange={(e) => updateField('toneStyle', e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-white leading-relaxed focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                사건 시점 (POV 서술 방식)
              </label>
              <input
                type="text"
                value={world.eventPov}
                onChange={(e) => updateField('eventPov', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                작성 시제 (Tense)
              </label>
              <input
                type="text"
                value={world.writingTense}
                onChange={(e) => updateField('writingTense', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 연도 및 시점 항목 */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-200 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              사건 발생 시점 (연도 기입)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={world.eventYear}
                onChange={(e) => updateField('eventYear', e.target.value)}
                placeholder="예: 2019"
                className="w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs text-zinc-400">년 (작중 본 사건이 벌어지는 시기)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-200 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              작성 / 회고 시점 (연도 기입)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={world.writingYear}
                onChange={(e) => updateField('writingYear', e.target.value)}
                placeholder="예: 2024"
                className="w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs text-zinc-400">년 (작자가 현재 서술하거나 회고하는 시점)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
