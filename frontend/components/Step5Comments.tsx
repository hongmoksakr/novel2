import React, { useState } from 'react';
import { NovelSettings, Episode, CommenterPersona, EpisodeComment, PlatformStyle } from '../types';
import { 
  Users, MessageSquare, Plus, Trash2, Wand2, Sparkles, 
  ArrowRight, Heart, ThumbsUp, RotateCcw, Shuffle 
} from 'lucide-react';
import { generatePersonasAI, generateBingeCommentsAI } from '../services/geminiService';

interface Step5CommentsProps {
  settings: NovelSettings;
  episodes: Episode[];
  personas: CommenterPersona[];
  comments: EpisodeComment[];
  onChangePersonas: (personas: CommenterPersona[]) => void;
  onChangeComments: (comments: EpisodeComment[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step5Comments: React.FC<Step5CommentsProps> = ({
  settings,
  episodes,
  personas,
  comments,
  onChangePersonas,
  onChangeComments,
  onNext,
  onPrev,
}) => {
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // New Persona Modal / Inline Form State
  const [newPersona, setNewPersona] = useState<Partial<CommenterPersona>>({
    name: '',
    platform: '노벨피아',
    age: '20대 중반',
    gender: '남성',
    personality: '',
    toneStyle: '',
    favoriteGenre: '판타지',
    avatarColor: 'bg-emerald-500'
  });

  const handleAddPersona = () => {
    if (personas.length >= 10) {
      alert('댓글러 페르소나는 최대 10명까지 등록 가능합니다.');
      return;
    }
    if (!newPersona.name) {
      alert('댓글러 닉네임을 입력해주세요.');
      return;
    }

    const created: CommenterPersona = {
      id: `p-${Date.now()}`,
      name: newPersona.name || '익명의독자',
      platform: (newPersona.platform as PlatformStyle) || '노벨피아',
      age: newPersona.age || '20대',
      gender: newPersona.gender || '남성',
      personality: newPersona.personality || '성격 무난함',
      toneStyle: newPersona.toneStyle || '자유로운 말투',
      favoriteGenre: newPersona.favoriteGenre || '판타지',
      avatarColor: newPersona.avatarColor || 'bg-indigo-500'
    };

    onChangePersonas([...personas, created]);
    setNewPersona({
      name: '',
      platform: '더쿠',
      age: '20대 후반',
      gender: '여성',
      personality: '',
      toneStyle: '',
      favoriteGenre: '로맨스판타지',
      avatarColor: 'bg-pink-500'
    });
  };

  const handleDeletePersona = (id: string) => {
    onChangePersonas(personas.filter(p => p.id !== id));
  };

  const handleAutoGeneratePersonas = async () => {
    if (personas.length >= 10) {
      alert('이미 10명의 페르소나가 가득 찼습니다.');
      return;
    }
    setLoadingPersonas(true);
    try {
      const generated = await generatePersonasAI(Math.min(5, 10 - personas.length));
      onChangePersonas([...personas, ...generated]);
    } catch (err) {
      alert('페르소나 자동 생성 실패');
    } finally {
      setLoadingPersonas(false);
    }
  };

  const handleGenerateBingeComments = async () => {
    if (personas.length === 0) {
      alert('먼저 댓글러 페르소나를 1명 이상 생성해주세요.');
      return;
    }
    if (episodes.length === 0) {
      alert('댓글을 달 에피소드가 없습니다.');
      return;
    }

    setLoadingComments(true);
    try {
      const newComments = await generateBingeCommentsAI(episodes, personas);
      onChangeComments(newComments);
    } catch (err) {
      alert('정주행 댓글 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingComments(false);
    }
  };

  const activeComments = comments.filter(c => c.episodeId === selectedEpId);
  const activeEpisode = episodes.find(e => e.id === selectedEpId) || episodes[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 p-6 rounded-2xl border border-pink-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                5단계
              </span>
              <h1 className="text-xl font-bold text-white">커뮤니티별 댓글러 페르소나 & 정주행 댓글</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              더쿠, 아카라이브, 노벨피아, 리디북스 등 주요 플랫폼의 성향을 가진 댓글러 10명을 구축하고,
              1회부터 n회까지 독자가 소설을 정주행하며 연속성(서사 누적) 있게 반응하는 실시간 댓글을 생성합니다.
            </p>
          </div>

          <button
            onClick={handleGenerateBingeComments}
            disabled={loadingComments || personas.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 text-xs transition"
          >
            <Sparkles className={`w-4 h-4 ${loadingComments ? 'animate-spin' : ''}`} />
            <span>{loadingComments ? '정주행 댓글 생성 중...' : '전 회차 정주행 댓글 일괄 생성'}</span>
          </button>
        </div>
      </div>

      {/* 1. Commenter Personas Management Section (Max 10) */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white">
              독자 페르소나 목록 ({personas.length} / 10명)
            </h2>
          </div>
          <button
            onClick={handleAutoGeneratePersonas}
            disabled={loadingPersonas || personas.length >= 10}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-pink-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <Wand2 className={`w-3.5 h-3.5 ${loadingPersonas ? 'animate-spin' : ''}`} />
            <span>AI 페르소나 자동 추가</span>
          </button>
        </div>

        {/* Personas Horizontal Scroll / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full ${p.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow`}>
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{p.name}</h4>
                    <span className="text-[10px] text-pink-400 font-medium">[{p.platform}]</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePersona(p.id)}
                  className="text-slate-600 hover:text-red-400 transition"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div><span className="text-slate-500">프로필:</span> {p.age} / {p.gender}</div>
                <div><span className="text-slate-500">성향:</span> {p.personality}</div>
                <div className="text-slate-400 italic font-mono text-[10px]">"{p.toneStyle}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Persona Form if < 10 */}
        {personas.length < 10 && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 block">+ 새 댓글러 페르소나 직접 등록</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="닉네임"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <select
                value={newPersona.platform}
                onChange={(e) => setNewPersona({ ...newPersona, platform: e.target.value as PlatformStyle })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="더쿠">더쿠 (과몰입/앓는체)</option>
                <option value="아카라이브">아카라이브 (효율/음슴체)</option>
                <option value="노벨피아">노벨피아 (사이다/캬)</option>
                <option value="리디북스">리디북스 (정갈/심층분석)</option>
                <option value="디시인사이드">디시인사이드 (냉소/직설)</option>
                <option value="조아라">조아라 (응원/정통)</option>
              </select>
              <input
                type="text"
                placeholder="연령/성별 (예: 20대 남성)"
                value={newPersona.age}
                onChange={(e) => setNewPersona({ ...newPersona, age: e.target.value })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="말투 특징 및 자주 쓰는 표현"
                value={newPersona.toneStyle}
                onChange={(e) => setNewPersona({ ...newPersona, toneStyle: e.target.value })}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddPersona}
                className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                페르소나 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Generated Sequential Comments Viewer */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              에피소드별 정주행 연속 댓글 검토
            </h3>
          </div>

          {/* Episode Selector Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEpId(ep.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  selectedEpId === ep.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                제{idx + 1}화 ({comments.filter(c => c.episodeId === ep.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Comments Stream */}
        {activeComments.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 mb-3">이 회차에 아직 생성된 댓글이 없습니다.</p>
            <button
              onClick={handleGenerateBingeComments}
              disabled={loadingComments}
              className="px-4 py-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 text-xs font-bold rounded-xl border border-pink-500/40"
            >
              상단 [전 회차 정주행 댓글 일괄 생성] 버튼을 눌러보세요
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeComments.map((comment) => (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-pink-400 shrink-0">
                  {comment.personaName.slice(0, 1)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{comment.personaName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {comment.platform}
                      </span>
                      {comment.reactionTag && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          #{comment.reactionTag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 hover:text-red-400 cursor-pointer">
                      <ThumbsUp className="w-3 h-3" /> {comment.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
        >
          이전: 4단계 부분 퇴고
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold rounded-xl shadow-lg transition"
        >
          <span>6단계: 최종 웹소설 플랫폼 뷰어 시연</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
