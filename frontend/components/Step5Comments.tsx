import React, { useState } from 'react';
import { CommenterPersona, EpisodeComment, EpisodeCard, PlatformType } from '../types';
import { generateBingeComments } from '../services/geminiService';
import { Users, Plus, Trash2, Sparkles, MessageCircle, RefreshCw, ThumbsUp } from 'lucide-react';

interface Step5Props {
  personas: CommenterPersona[];
  comments: EpisodeComment[];
  episodes: EpisodeCard[];
  onUpdatePersonas: (updated: CommenterPersona[]) => void;
  onAddComments: (newComments: EpisodeComment[]) => void;
}

export const Step5Comments: React.FC<Step5Props> = ({
  personas,
  comments,
  episodes,
  onUpdatePersonas,
  onAddComments,
}) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(episodes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // New Persona Form State
  const [newPersona, setNewPersona] = useState<Partial<CommenterPersona>>({
    name: '',
    platform: 'Theqoo',
    age: '20대',
    gender: '여성',
    personality: '주접팬 / 과몰입러',
    commentTone: '와 진짜 미쳤다 ㅠㅠㅠ 다음화 제발요',
  });

  const handleAddPersona = () => {
    if (!newPersona.name || personas.length >= 10) return;

    const persona: CommenterPersona = {
      id: `p-${Date.now()}`,
      name: newPersona.name || '익명독자',
      platform: (newPersona.platform as PlatformType) || 'Theqoo',
      age: newPersona.age || '20대',
      gender: newPersona.gender || '무관',
      personality: newPersona.personality || '일반 독자',
      commentTone: newPersona.commentTone || '재밌어요',
      avatarSeed: `seed-${Math.random()}`,
    };

    onUpdatePersonas([...personas, persona]);
    setNewPersona({
      name: '',
      platform: 'Theqoo',
      age: '20대',
      gender: '여성',
      personality: '주접팬 / 과몰입러',
      commentTone: '와 진짜 미쳤다 ㅠㅠㅠ 다음화 제발요',
    });
  };

  const handleDeletePersona = (id: string) => {
    if (confirm('이 독자 페르소나를 삭제하시겠습니까?')) {
      onUpdatePersonas(personas.filter((p) => p.id !== id));
    }
  };

  const handleGenerateEpisodeComments = async () => {
    const ep = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];
    if (!ep) return;

    setIsGenerating(true);

    try {
      // Gather past comments summary for binge reading continuity
      const pastSummary = comments
        .map((c) => `[${c.authorName}] ${c.content}`)
        .slice(-5)
        .join(' / ');

      const results = await generateBingeComments(
        ep,
        ep.outline,
        personas,
        pastSummary
      );

      const newComments: EpisodeComment[] = results.map((r, i) => {
        const persona = personas.find((p) => p.id === r.personaId) || personas[i % personas.length];
        return {
          id: `cmt-${Date.now()}-${i}`,
          episodeId: ep.id,
          personaId: persona.id,
          authorName: persona.name,
          platform: persona.platform,
          content: r.content,
          upvotes: r.upvotes || Math.floor(Math.random() * 30) + 5,
          downvotes: r.downvotes || 1,
          timestamp: '방금 전',
          rating: r.rating || 5,
          isBest: r.isBest,
        };
      });

      onAddComments(newComments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredComments = comments.filter((c) => c.episodeId === selectedEpisodeId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 5
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              독자 페르소나 관리 및 연쇄 반응 댓글 생성기
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            더쿠, 아카라이브, 노벨피아, 리디북스 등 플랫폼별 독자 성향(최대 10명)을 관리하고 회차별 정주행 연속 댓글을 시뮬레이션합니다.
          </p>
        </div>

        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          페르소나: <strong className="text-violet-400">{personas.length} / 10</strong>명
        </div>
      </div>

      {/* Persona Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-violet-400" />
          현재 등록된 독자 페르소나 (최대 10명)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {personas.map((p) => {
            const platformBadgeColor: Record<PlatformType, string> = {
              Theqoo: 'bg-rose-950 text-rose-300 border-rose-800',
              ArcaLive: 'bg-cyan-950 text-cyan-300 border-cyan-800',
              Novelpia: 'bg-amber-950 text-amber-300 border-amber-800',
              RidiBooks: 'bg-indigo-950 text-indigo-300 border-indigo-800',
            };

            return (
              <div
                key={p.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${platformBadgeColor[p.platform]}`}>
                    {p.platform}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePersona(p.id)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="페르소나 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-bold text-sm text-white">{p.name}</div>
                <div className="text-[11px] text-zinc-400">
                  {p.age} · {p.gender}
                </div>
                <div className="text-[11px] text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 leading-relaxed italic">
                  "{p.commentTone}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Persona Form */}
      {personas.length < 10 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-violet-400" />
            새로운 독자 페르소나 추가
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">닉네임</label>
              <input
                type="text"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                placeholder="예: 사제지간진심녀"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">플랫폼 스타일</label>
              <select
                value={newPersona.platform}
                onChange={(e) => setNewPersona({ ...newPersona, platform: e.target.value as PlatformType })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Theqoo">더쿠 (Theqoo)</option>
                <option value="ArcaLive">아카라이브 (ArcaLive)</option>
                <option value="Novelpia">노벨피아 (Novelpia)</option>
                <option value="RidiBooks">리디북스 (Ridi Books)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">연령 및 성별</label>
              <input
                type="text"
                value={`${newPersona.age} / ${newPersona.gender}`}
                onChange={(e) => {
                  const [age, gender] = e.target.value.split('/');
                  setNewPersona({ ...newPersona, age: age?.trim() || '', gender: gender?.trim() || '' });
                }}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">댓글 어투 및 밈 성향</label>
              <input
                type="text"
                value={newPersona.commentTone}
                onChange={(e) => setNewPersona({ ...newPersona, commentTone: e.target.value })}
                placeholder="예: 훈수충, 주접팬, 밈 활용..."
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAddPersona}
              disabled={!newPersona.name?.trim()}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            >
              페르소나 등록
            </button>
          </div>
        </div>
      )}

      {/* Sequential Binge-Reading Comment Generator */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-violet-400" />
              회차별 연쇄 반응 댓글 생성 (Binge-reading Engine)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              이전 회차들의 복선과 독자 기억을 유지한 채 입체적인 실시간 댓글을 자동 시뮬레이션합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEpisodeId}
              onChange={(e) => setSelectedEpisodeId(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-medium"
            >
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleGenerateEpisodeComments}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isGenerating ? '독자 반응 생성 중...' : '해당 회차 독자 댓글 생성'}</span>
            </button>
          </div>
        </div>

        {/* Generated Comments List */}
        <div className="space-y-3">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              아직 해당 회차에 생성된 독자 댓글이 없습니다. 상단 버튼을 눌러 연쇄 반응을 생성해 보세요!
            </div>
          ) : (
            filteredComments.map((cmt) => (
              <div
                key={cmt.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-zinc-800 text-zinc-300">
                      {cmt.platform}
                    </span>
                    <span className="text-xs font-bold text-white">{cmt.authorName}</span>
                    <span className="text-[10px] text-zinc-500">{cmt.timestamp}</span>
                    {cmt.isBest && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        BEST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">{cmt.content}</p>
                </div>

                <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                  <ThumbsUp className="w-3 h-3 text-violet-400" />
                  <span>{cmt.upvotes}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
