import React, { useState } from 'react';
import { CommenterPersona, EpisodeComment, EpisodeCard, PlatformType, WorldbuildingState, ChapterDraft } from '../types';
import { generateBingeComments, generateRandomPersonaAI, generateCommentRepliesAI } from '../services/geminiService';
import { Users, Plus, Trash2, Sparkles, MessageCircle, RefreshCw, ThumbsUp, Wand2, Edit3, Check, X, Globe, UserCheck, Hourglass, BookOpen, MessageSquarePlus, Sparkle, MessagesSquare, CornerDownRight, Flame, Shuffle } from 'lucide-react';

interface Step5Props {
  personas: CommenterPersona[];
  comments: EpisodeComment[];
  episodes: EpisodeCard[];
  world: WorldbuildingState;
  drafts?: Record<string, ChapterDraft>;
  onUpdatePersonas: (updated: CommenterPersona[]) => void;
  onAddComments: (newComments: EpisodeComment[]) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const Step5Comments: React.FC<Step5Props> = ({
  personas,
  comments,
  episodes,
  world,
  drafts = {},
  onUpdatePersonas,
  onAddComments,
  onDeleteComment,
}) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(episodes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [targetPlatformForAi, setTargetPlatformForAi] = useState<PlatformType>('Theqoo');

  const [personaUserInstruction, setPersonaUserInstruction] = useState<string>('');
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CommenterPersona>>({});
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [newPersona, setNewPersona] = useState<Partial<CommenterPersona>>({
    name: '',
    platform: 'Theqoo',
    age: '20대 후반',
    gender: '여성',
    personality: '더쿠 로설방 주접러',
    commentTone: '아 미친거아님???ㅠㅠㅠㅠㅠㅠㅠ 남주 존댓말 씌앙롬 유죄인간아 내 심장 어쩔건데ㅠㅠ 도파민 도라방스다 진짜',
  });

  const handleAddPersona = () => {
    if (!newPersona.name?.trim() || personas.length >= 10) return;

    const persona: CommenterPersona = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newPersona.name.trim(),
      platform: (newPersona.platform as PlatformType) || 'Theqoo',
      age: newPersona.age || '20대',
      gender: newPersona.gender || '무관',
      personality: newPersona.personality || (newPersona.platform === 'Acquaintance' ? '실제 손세미와 최창환을 아는 교회 지인' : '일반 독자'),
      commentTone: newPersona.commentTone || '재밌어요',
      avatarSeed: `seed-${Math.random()}`,
    };

    onUpdatePersonas([...personas, persona]);
    setNewPersona({
      name: '',
      platform: 'Theqoo',
      age: '20대 후반',
      gender: '여성',
      personality: '더쿠 로설방 주접러',
      commentTone: '아 미친거아님???ㅠㅠㅠㅠㅠㅠㅠ 남주 존댓말 씌앙롬 유죄인간아 내 심장 어쩔건데ㅠㅠ 도파민 도라방스다 진짜',
    });
  };

  const handleStartEditPersona = (p: CommenterPersona) => {
    setEditingPersonaId(p.id);
    setEditFormData({
      name: p.name,
      platform: p.platform,
      age: p.age,
      gender: p.gender,
      personality: p.personality,
      commentTone: p.commentTone,
    });
  };

  const handleSaveEditPersona = (id: string) => {
    onUpdatePersonas(
      personas.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name: editFormData.name || p.name,
            platform: (editFormData.platform as PlatformType) || p.platform,
            age: editFormData.age || p.age,
            gender: editFormData.gender || p.gender,
            personality: editFormData.personality || p.personality,
            commentTone: editFormData.commentTone || p.commentTone,
          };
        }
        return p;
      })
    );
    setEditingPersonaId(null);
  };

  const handleDeletePersona = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = personas.filter((p) => p.id !== id);
    onUpdatePersonas(updated);
    if (editingPersonaId === id) setEditingPersonaId(null);
  };

  const handleAiAutoGeneratePersona = async (overrideInstruction?: string) => {
    if (personas.length >= 10 || isGeneratingPersona) return;
    setIsGeneratingPersona(true);

    const instructionToUse = overrideInstruction || personaUserInstruction;

    try {
      const randomPersona = await generateRandomPersonaAI(targetPlatformForAi, world, instructionToUse);
      onUpdatePersonas([...personas, randomPersona]);
      if (!overrideInstruction) setPersonaUserInstruction('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleGenerateEpisodeComments = async () => {
    const ep = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];
    if (!ep || personas.length === 0) return;

    setIsGenerating(true);

    const targetDraft = drafts[ep.id];
    const fullDraftContent = targetDraft?.content || ep.outline;

    const epPartNum = ep.part || 1;
    const currentPartObj = (world.parts || []).find(p => p.partNumber === epPartNum);

    try {
      const pastSummary = comments
        .map((c) => `[${c.authorName}] ${c.content}`)
        .slice(-5)
        .join(' / ');

      const results = await generateBingeComments(
        ep,
        fullDraftContent,
        personas,
        pastSummary,
        currentPartObj,
        world
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

  // ★ 사용자 요구사항: [댓글 대화 생성] 클릭할 때마다:
  // 1) 5개 이상의 대댓글이 연쇄 추가됨
  // 2) 대상 댓글이 생성할 때마다 무작위(Random)로 달라짐
  const handleGenerateCommentReplies = async () => {
    const ep = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];
    if (!ep || rootComments.length === 0 || personas.length === 0) return;

    setIsGeneratingReplies(true);

    // ★ 생성할 때마다 임의적으로 달라지는 타겟 댓글 선정 (무작위 셔플 후 1~3개 선정)
    const shuffledRootComments = [...rootComments].sort(() => Math.random() - 0.5);
    const targetCount = Math.min(shuffledRootComments.length, Math.floor(Math.random() * 2) + 2); // 2개 또는 3개
    const randomTargetComments = shuffledRootComments.slice(0, targetCount);

    try {
      const replyResults = await generateCommentRepliesAI(randomTargetComments, personas, world);

      const newReplies: EpisodeComment[] = replyResults.map((rr, idx) => ({
        id: `reply-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        episodeId: ep.id,
        personaId: rr.personaId,
        authorName: rr.authorName,
        platform: rr.platform,
        content: rr.content,
        upvotes: rr.upvotes || Math.floor(Math.random() * 15) + 3,
        downvotes: 0,
        timestamp: '방금 전 답글',
        parentId: rr.parentId,
        replyToAuthor: rr.replyToAuthor,
      }));

      onAddComments(newReplies);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const handleExecuteDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
    setDeletingCommentId(null);
  };

  const filteredComments = comments.filter((c) => c.episodeId === selectedEpisodeId);
  const rootComments = filteredComments.filter((c) => !c.parentId);
  const repliesMap = filteredComments.reduce<Record<string, EpisodeComment[]>>((acc, cur) => {
    if (cur.parentId) {
      acc[cur.parentId] = acc[cur.parentId] || [];
      acc[cur.parentId].push(cur);
    }
    return acc;
  }, {});

  const selectedEpObj = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];
  const selectedPartNum = selectedEpObj?.part || 1;
  const selectedPartInfo = (world.parts || []).find(p => p.partNumber === selectedPartNum);

  const platformList: { type: PlatformType; label: string; badge: string }[] = [
    { type: 'Theqoo', label: '더쿠 (Theqoo)', badge: 'bg-rose-950 text-rose-300 border-rose-800' },
    { type: 'ArcaLive', label: '아카라이브 (ArcaLive)', badge: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    { type: 'Acquaintance', label: '교회 지인 (실제 손세미·최창환 아는 사람)', badge: 'bg-amber-950 text-amber-300 border-amber-600' },
    { type: 'Novelpia', label: '노벨피아 (Novelpia)', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    { type: 'RidiBooks', label: '리디북스 (Ridi Books)', badge: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
  ];

  const quickConceptChips: Record<PlatformType, { label: string; prompt: string }[]> = {
    Theqoo: [
      { label: '대가리깨는 주접러', prompt: '남주 존댓말 명령조에 심장 멎어서 대가리 팍팍 깨며 오열하는 과몰입 더쿠 로설방 유저' },
      { label: '문장·감정선 분석러', prompt: '성가대실 밀실의 문체와 죄책감 묘사, 손세미의 내면 심리선을 나노 단위로 짚어내는 도서방 덬' },
      { label: '츤데레 과몰입러', prompt: '남주 씌앙롬 유죄인간이라고 분노하면서도 결제하고 제일 먼저 달리는 츤데레 덬' },
      { label: '모태신앙 고증러', prompt: '모태신앙인데 교회 예배당과 성가대실 분위기 고증이 너무 리얼해서 소름 돋아 하는 덬' },
      { label: '현생 파탄 난 직장인', prompt: '내일 출근인데 새벽에 손세미 숨소리 떨리는 거 보고 잠 다 깨버린 현생 파탄러' }
    ],
    ArcaLive: [
      { label: '알파메일 찬양 챈러', prompt: '남주의 압도적인 통제력과 참교육에 알파메일력 GOAT 외치며 개추 박는 챈러' },
      { label: '매운맛 감별사', prompt: '체액과 결박, 음탕한 마찰음 수위를 집중 검증하며 꼴잘알 외치는 매운맛 마니아' },
      { label: '비틀린 순애론자', prompt: '서로 완전히 길들이고 암컷타락 시키는 게 진정한 참순애라고 우기는 서브컬처 유저' },
      { label: '연참 협박 챈러', prompt: '다음 화 사택 씬 연참 안 달리면 작가 집 찾아간다고 음슴체로 날뛰는 유저' }
    ],
    Acquaintance: [
      { label: '성가대 옆자리 동료', prompt: '주일마다 단아하게 가운 입고 찬양 부르던 손세미 쌤의 음탕한 속내에 흥분해 관음하는 지인' },
      { label: '최창환 신대원 동기', prompt: '평소 깍듯한 척하던 전도사 최창환이 뒤에서 8살 연상 여교사를 길들였다는 사실에 감탄하는 남성 지인' },
      { label: '손세미 짝사랑남', prompt: '단정하게 거절당했던 손세미가 전도사 앞에서는 발칙하고 음탕하게 굴복했다는 상상에 미쳐 날뛰는 지인' },
      { label: '청년부 임원', prompt: '소설 속 밀회 장소를 실제 교회 동선과 대조하며 소름 돋는 관음적 쾌락에 빠진 지인' }
    ],
    Novelpia: [
      { label: '장르 빌드업 분석러', prompt: '조교물과 사제지간 클리셰의 단계별 타락 구조를 정밀 분석하는 누렁이 독자' },
      { label: '고수위 찬양러', prompt: '필터링 없는 성애 묘사의 천박함에 환호하며 랭킹 1등 가자고 외치는 독자' }
    ],
    RidiBooks: [
      { label: '해시태그 서평러', prompt: '#사제지간 #조교물 #개신교회연애물 키워드를 나열하며 별점 5점 주는 정통 로설러' },
      { label: '피폐 텐션 극찬러', prompt: '종교적 경건함과 농밀한 배덕미의 대조를 우아한 문체로 칭찬하는 리뷰어' }
    ]
  };

  const isSohnSemi1stPerson = (world.eventPov && (world.eventPov.includes('1인칭') || world.eventPov.includes('손세미'))) || false;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Intro Header */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 5
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              독자 페르소나 관리 &amp; 핫댓글 대화(대댓글) 시뮬레이터
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            원하는 컨셉의 페르소나를 AI로 생성하고, <strong>[댓글 대화 생성] 버튼을 누를 때마다 임의의 댓글 아래로 5개 이상의 댓댓글 대화가 연쇄 생성</strong>됩니다.
          </p>
        </div>

        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          페르소나: <strong className="text-violet-400">{personas.length} / 10</strong>명
        </div>
      </div>

      {/* 손세미 1인칭 시점 인지 배너 */}
      {isSohnSemi1stPerson && (
        <div className="rounded-xl border border-violet-700/80 bg-violet-950/40 p-3.5 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2 text-violet-200">
            <BookOpen className="w-4 h-4 text-violet-400 shrink-0" />
            <span>
              현재 사건 시점이 <strong>[손세미 1인칭]</strong>으로 설정되어 있습니다. 댓글 생성 시 독자들은 <strong>"작가가 곧 여교사 손세미 본인"</strong>이라는 충격적인 고백 수기 설정을 염두에 두고 반응합니다!
            </span>
          </div>
          <span className="text-[10px] text-violet-300 font-bold bg-violet-900/80 px-2 py-0.5 rounded border border-violet-600 shrink-0">
            손세미 작가 본인 인식 모드
          </span>
        </div>
      )}

      {/* 현재 선택된 회차의 부간 간극 안내 배너 */}
      {selectedPartNum > 1 && selectedPartInfo?.hiatusDuration && (
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/30 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Hourglass className="w-4 h-4 text-amber-400" />
            <span>
              선택된 회차는 <strong>{selectedPartNum - 1}부 종료 후 [{selectedPartInfo.hiatusDuration}] 동안의 휴재</strong> 끝에 연재된 {selectedPartNum}부 에피소드입니다.
            </span>
          </div>
          <span className="text-[11px] text-amber-400/90 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800/80">
            {selectedPartInfo.hiatusDuration} 대기 감정 반영
          </span>
        </div>
      )}

      {/* 페르소나 생성 컨트롤러 */}
      <div className="rounded-xl border border-violet-800/60 bg-zinc-900/80 p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white">생성할 페르소나 커뮤니티/카테고리 선택:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={targetPlatformForAi}
              onChange={(e) => setTargetPlatformForAi(e.target.value as PlatformType)}
              className="rounded-lg border border-violet-600 bg-zinc-950 px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
            >
              {platformList.map((p) => (
                <option key={p.type} value={p.type}>
                  {p.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleAiAutoGeneratePersona()}
              disabled={isGeneratingPersona || personas.length >= 10}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-900/40 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap"
            >
              {isGeneratingPersona ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              <span>[{targetPlatformForAi === 'Acquaintance' ? '교회 지인' : targetPlatformForAi}] 페르소나 생성</span>
            </button>
          </div>
        </div>

        {/* 원클릭 추천 아키타입 칩 */}
        <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2">
          <div className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1 text-violet-300">
              <Sparkle className="w-3.5 h-3.5 text-amber-400" />
              [{targetPlatformForAi === 'Acquaintance' ? '교회 지인' : targetPlatformForAi}] 추천 세부 아키타입 (클릭 시 즉시 생성):
            </span>
            <span className="text-[10px] text-zinc-500">클릭 시 다양한 개성으로 맞춤 생성됩니다</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(quickConceptChips[targetPlatformForAi] || []).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPersonaUserInstruction(chip.prompt);
                  handleAiAutoGeneratePersona(chip.prompt);
                }}
                disabled={isGeneratingPersona || personas.length >= 10}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-violet-500 hover:bg-violet-950/40 transition-all cursor-pointer disabled:opacity-40"
              >
                + {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
            <MessageSquarePlus className="w-3.5 h-3.5 text-violet-400" />
            <span>직접 맞춤 지침 작성 (원하는 구체적 성향 및 관계):</span>
          </label>
          <input
            type="text"
            value={personaUserInstruction}
            onChange={(e) => setPersonaUserInstruction(e.target.value)}
            placeholder="예: 최창환 전도사를 평소 짝사랑하던 20대 청년부 자매, 또는 20대 공대생 남초 챈 유저..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 페르소나 카드 목록 */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-violet-400" />
          현재 등록된 독자 페르소나 (최대 10명)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {personas.map((p) => {
            const isEditing = editingPersonaId === p.id;
            const platformBadge = platformList.find(pl => pl.type === p.platform)?.badge || 'bg-zinc-800 text-zinc-300 border-zinc-700';

            return (
              <div
                key={p.id}
                className={`rounded-xl border p-4 space-y-3 relative group transition-all ${
                  isEditing
                    ? 'border-violet-500 bg-zinc-900 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500'
                    : p.platform === 'Acquaintance'
                    ? 'border-amber-700/80 bg-amber-950/20 hover:border-amber-600'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                      <span className="text-xs font-bold text-violet-300 flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> 페르소나 정보 수정
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPersonaId(null)}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">닉네임</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">플랫폼/카테고리</label>
                        <select
                          value={editFormData.platform}
                          onChange={(e) => setEditFormData({ ...editFormData, platform: e.target.value as PlatformType })}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-xs text-white font-bold"
                        >
                          <option value="Theqoo">더쿠</option>
                          <option value="ArcaLive">아카라이브</option>
                          <option value="Acquaintance">교회 지인</option>
                          <option value="Novelpia">노벨피아</option>
                          <option value="RidiBooks">리디북스</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">나이/성별</label>
                        <input
                          type="text"
                          value={`${editFormData.age || ''} / ${editFormData.gender || ''}`}
                          onChange={(e) => {
                            const [age, gender] = e.target.value.split('/');
                            setEditFormData({ ...editFormData, age: age?.trim() || '', gender: gender?.trim() || '' });
                          }}
                          className="w-full rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">성향 요약</label>
                      <input
                        type="text"
                        value={editFormData.personality || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, personality: e.target.value })}
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">시그니처 댓글 말투 예시</label>
                      <textarea
                        rows={2}
                        value={editFormData.commentTone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, commentTone: e.target.value })}
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingPersonaId(null)}
                        className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditPersona(p.id)}
                        className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> 저장 완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${platformBadge}`}>
                          {p.platform === 'Acquaintance' ? '교회 지인' : p.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditPersona(p)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-violet-300 hover:bg-zinc-700 transition-colors cursor-pointer"
                          title="페르소나 세부 사항 직접 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePersona(e, p.id)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                          title="페르소나 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1">
                        {p.platform === 'Acquaintance' && <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span>{p.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {p.age} · {p.gender} · {p.personality}
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed italic">
                      "{p.commentTone}"
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 수동 페르소나 추가 폼 */}
      {personas.length < 10 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-violet-400" />
            새로운 독자 페르소나 직접 수동 추가
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">닉네임</label>
              <input
                type="text"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                placeholder="예: 성가대_동료"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">플랫폼/카테고리</label>
              <select
                value={newPersona.platform}
                onChange={(e) => setNewPersona({ ...newPersona, platform: e.target.value as PlatformType })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white font-bold"
              >
                <option value="Theqoo">더쿠 (Theqoo)</option>
                <option value="ArcaLive">아카라이브 (ArcaLive)</option>
                <option value="Acquaintance">교회 지인 (실제 손세미·최창환 아는 교인)</option>
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
                placeholder="예: 특정 어투 예시..."
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

      {/* 회차별 실제 본문 정독 댓글 & [댓글 대화 생성] 컨트롤 박스 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-violet-400" />
              회차별 실제 본문 완독 후 독자 반응 &amp; 댓댓글 대화
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              본문 완독 댓글을 생성하고, <strong>[댓글 대화 생성]</strong>을 누를 때마다 <strong>임의의 댓글을 골라 5개 이상의 대댓글 대화(@닉네임 상호 태그)</strong>를 지속적으로 추가합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEpisodeId}
              onChange={(e) => setSelectedEpisodeId(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white font-medium"
            >
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  [{ep.part || 1}부] {ep.title}
                </option>
              ))}
            </select>

            {/* 기본 본문 완독 댓글 생성 버튼 */}
            <button
              type="button"
              onClick={handleGenerateEpisodeComments}
              disabled={isGenerating || personas.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isGenerating ? '댓글 생성 중...' : '본문 완독 댓글 생성'}</span>
            </button>

            {/* ★ 사용자 요구사항: 클릭할 때마다 임의의 댓글에 5개 이상의 대댓글이 추가되는 [댓글 대화 생성] 버튼 */}
            <button
              type="button"
              onClick={handleGenerateCommentReplies}
              disabled={isGeneratingReplies || rootComments.length === 0 || personas.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-40"
              title="클릭할 때마다 임의의 댓글을 골라 5개 이상의 댓댓글 대화(@닉네임 상호 태그)가 추가 생성됩니다"
            >
              {isGeneratingReplies ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessagesSquare className="w-3.5 h-3.5" />}
              <span>{isGeneratingReplies ? '대댓글 5개+ 생성 중...' : '댓글 대화 생성 (5개+ 추가)'}</span>
            </button>
          </div>
        </div>

        {/* Generated Comments List (부모 댓글 + 대댓글 계층 렌더링) */}
        <div className="space-y-4">
          {rootComments.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              아직 해당 회차에 생성된 독자 댓글이 없습니다. Step 3에서 본문을 작성한 뒤 [본문 완독 댓글 생성]을 눌러보세요!
            </div>
          ) : (
            rootComments.map((cmt) => {
              const isAcquaintance = cmt.platform === 'Acquaintance';
              const isDeletingThis = deletingCommentId === cmt.id;
              const replies = repliesMap[cmt.id] || [];

              return (
                <div key={cmt.id} className="space-y-2">
                  {/* 부모 댓글 카드 */}
                  <div
                    className={`rounded-xl border p-4 flex items-start justify-between gap-3 transition-all ${
                      isAcquaintance
                        ? 'border-amber-700/60 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isAcquaintance
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {isAcquaintance ? '교회 지인' : cmt.platform}
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {isAcquaintance && <UserCheck className="w-3 h-3 text-amber-400" />}
                          {cmt.authorName}
                        </span>
                        <span className="text-[10px] text-zinc-500">{cmt.timestamp}</span>
                        {cmt.isBest && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-amber-400" /> BEST
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed font-sans">{cmt.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                        <ThumbsUp className="w-3 h-3 text-violet-400" />
                        <span>{cmt.upvotes}</span>
                      </div>

                      {/* 부모 댓글 삭제 */}
                      {isDeletingThis ? (
                        <div className="flex items-center gap-1 bg-red-950 p-1 rounded border border-red-700">
                          <button
                            type="button"
                            onClick={() => handleExecuteDeleteComment(cmt.id)}
                            className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCommentId(null)}
                            className="p-0.5 text-zinc-400 hover:text-white"
                            title="취소"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingCommentId(cmt.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="이 댓글 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ★ 대댓글 렌더링 영역 (들여쓰기 및 상호 @닉네임 태그 표시) */}
                  {replies.length > 0 && (
                    <div className="pl-6 sm:pl-8 space-y-2 border-l-2 border-violet-800/40 ml-4">
                      {replies.map((rep) => {
                        const isRepDeleting = deletingCommentId === rep.id;
                        const isRepAcquaintance = rep.platform === 'Acquaintance';

                        return (
                          <div
                            key={rep.id}
                            className={`rounded-lg border p-3 flex items-start justify-between gap-2.5 transition-all ${
                              isRepAcquaintance
                                ? 'border-amber-800/50 bg-amber-950/30'
                                : 'border-zinc-800/80 bg-zinc-900/80'
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  isRepAcquaintance ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {isRepAcquaintance ? '교회 지인' : rep.platform}
                                </span>
                                <span className="text-[11px] font-bold text-white">{rep.authorName}</span>
                                {rep.replyToAuthor && (
                                  <span className="text-[10px] text-violet-400 font-semibold bg-violet-950/80 px-1.5 py-0.2 rounded border border-violet-800/60 font-mono">
                                    @{rep.replyToAuthor}에게 답글
                                  </span>
                                )}
                                <span className="text-[9px] text-zinc-500">{rep.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-zinc-200 leading-relaxed font-sans pl-5">{rep.content}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                <ThumbsUp className="w-2.5 h-2.5 text-violet-400" />
                                <span>{rep.upvotes}</span>
                              </div>

                              {isRepDeleting ? (
                                <div className="flex items-center gap-1 bg-red-950 p-0.5 rounded border border-red-700">
                                  <button
                                    type="button"
                                    onClick={() => handleExecuteDeleteComment(rep.id)}
                                    className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingCommentId(null)}
                                    className="p-0.5 text-zinc-400 hover:text-white"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingCommentId(rep.id)}
                                  className="p-1 rounded text-zinc-500 hover:text-red-400"
                                  title="대댓글 삭제"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
