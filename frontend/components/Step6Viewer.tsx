import React, { useState } from 'react';
import { NovelSettings, Episode, EpisodeComment } from '../types';
import { 
  BookOpen, Heart, Share2, MessageSquare, ThumbsUp, 
  ArrowLeft, ArrowRight, Eye, Sparkles, Sun, Moon, 
  Type, Bookmark, CheckCircle2 
} from 'lucide-react';

interface Step6ViewerProps {
  settings: NovelSettings;
  episodes: Episode[];
  comments: EpisodeComment[];
  onPrev: () => void;
}

export const Step6Viewer: React.FC<Step6ViewerProps> = ({
  settings,
  episodes,
  comments,
  onPrev,
}) => {
  const [currentEpIndex, setCurrentEpIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose'>('loose');
  const [themeMode, setThemeMode] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [liked, setLiked] = useState(false);
  const [userCommentText, setUserCommentText] = useState('');
  const [localComments, setLocalComments] = useState<EpisodeComment[]>(comments);

  const currentEpisode = episodes[currentEpIndex] || episodes[0];
  const episodeComments = localComments.filter(c => c.episodeId === currentEpisode?.id);

  const handleNextEp = () => {
    if (currentEpIndex < episodes.length - 1) {
      setCurrentEpIndex(currentEpIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevEp = () => {
    if (currentEpIndex > 0) {
      setCurrentEpIndex(currentEpIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddUserComment = () => {
    if (!userCommentText.trim()) return;
    const newC: EpisodeComment = {
      id: `user-c-${Date.now()}`,
      episodeId: currentEpisode.id,
      personaId: 'user-self',
      personaName: '작가(본인)',
      platform: '노벨피아',
      content: userCommentText,
      likes: 1,
      dislikes: 0,
      createdAt: '방금 전',
      reactionTag: '작가공지'
    };
    setLocalComments([newC, ...localComments]);
    setUserCommentText('');
  };

  // Typography helpers
  const fontClass = fontSize === 'sm' ? 'text-sm' :
                    fontSize === 'base' ? 'text-base' :
                    fontSize === 'lg' ? 'text-lg' : 'text-xl';

  const themeClass = themeMode === 'dark' ? 'bg-slate-950 text-slate-100 border-slate-800' :
                     themeMode === 'sepia' ? 'bg-[#f4ecd8] text-[#3e2c1c] border-[#e2d5b8]' :
                     'bg-white text-slate-900 border-slate-200';

  const themeInnerCard = themeMode === 'dark' ? 'bg-slate-900 border-slate-800' :
                         themeMode === 'sepia' ? 'bg-[#efe6ce] border-[#dfd4b4]' :
                         'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Platform Header & Reader Controls Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="이전 단계로"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">웹소설 리더 시연 모드</span>
            <h1 className="text-sm font-bold text-white line-clamp-1">{settings.title}</h1>
          </div>
        </div>

        {/* Viewer Settings (Font Size, Theme, Episode Jumper) */}
        <div className="flex items-center gap-3 text-xs">
          {/* Episode Selector */}
          <select
            value={currentEpIndex}
            onChange={(e) => setCurrentEpIndex(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs"
          >
            {episodes.map((ep, idx) => (
              <option key={ep.id} value={idx}>
                제{idx + 1}화 ({ep.stageTitle.split('(')[0]})
              </option>
            ))}
          </select>

          {/* Font Size Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${fontSize === 'sm' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
            >
              가-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${fontSize === 'base' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
            >
              기본
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${fontSize === 'lg' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
            >
              가+
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-1 rounded ${themeMode === 'dark' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
              title="다크 모드"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${themeMode === 'sepia' ? 'bg-amber-700 text-white' : 'text-slate-400'}`}
              title="세피아 종이 모드"
            >
              노랑
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`p-1 rounded ${themeMode === 'light' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
              title="라이트 모드"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reader Paper Container */}
      <div className={`rounded-3xl border shadow-2xl p-6 md:p-12 transition-colors duration-200 ${themeClass}`}>
        {/* Episode Header */}
        <div className="border-b pb-6 mb-8 border-current/10 space-y-2">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>{settings.genre}</span>
            <span>{currentEpisode?.stageTitle}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif">{currentEpisode?.title}</h2>
          <div className="flex items-center gap-3 text-xs opacity-60 pt-1">
            <span>조회수 14,290</span>
            <span>추천수 {liked ? 892 : 891}</span>
            <span>댓글 {episodeComments.length}개</span>
          </div>
        </div>

        {/* Novel Body Content */}
        <div
          className={`font-serif leading-loose tracking-wide whitespace-pre-wrap ${fontClass} ${
            lineHeight === 'loose' ? 'leading-[2.2]' : 'leading-relaxed'
          }`}
        >
          {currentEpisode?.content || (
            <div className="py-16 text-center opacity-50 italic">
              아직 집필된 본문이 없습니다. 3단계에서 [AI 본문 집필]을 실행해주세요.
            </div>
          )}
        </div>

        {/* Author Postscript Note */}
        <div className={`mt-14 p-5 rounded-2xl border ${themeInnerCard} space-y-2`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>작가의 말</span>
          </div>
          <p className="text-xs leading-relaxed opacity-80">
            독자 여러분 늘 열렬한 응원과 댓글 감사드립니다!
            이번 {currentEpIndex + 1}화는 영웅의 여정 중 [{currentEpisode?.stageTitle}]을 본격적으로 풀어낸 회차입니다.
            재미있으셨다면 추천과 선작 한 번씩 꾹 부탁드립니다! ❤️
          </p>
        </div>

        {/* Like & Reaction Bar */}
        <div className="mt-8 flex items-center justify-center gap-4 border-t pt-8 border-current/10">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition ${
              liked
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-current/5 hover:bg-current/10 text-current'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>추천 {liked ? 892 : 891}</span>
          </button>
          <button
            onClick={() => alert('소설 링크가 클립보드에 복사되었습니다.')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-current/5 hover:bg-current/10 text-current transition"
          >
            <Share2 className="w-4 h-4" />
            <span>공유</span>
          </button>
        </div>

        {/* Episode Pagination Controls */}
        <div className="mt-10 flex items-center justify-between border-t pt-6 border-current/10">
          <button
            onClick={handlePrevEp}
            disabled={currentEpIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-current/5 hover:bg-current/10 disabled:opacity-30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이전화</span>
          </button>
          <span className="text-xs font-mono font-bold opacity-70">
            {currentEpIndex + 1} / {episodes.length} 화
          </span>
          <button
            onClick={handleNextEp}
            disabled={currentEpIndex === episodes.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-30 transition shadow"
          >
            <span>다음화</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Real Comments Section */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">독자 반응 및 정주행 댓글 ({episodeComments.length})</h3>
          </div>
          <span className="text-xs text-slate-400">5단계에서 생성된 플랫폼별 페르소나 댓글</span>
        </div>

        {/* Comment Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userCommentText}
            onChange={(e) => setUserCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUserComment()}
            placeholder="감상평이나 작가 공지를 남겨보세요..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleAddUserComment}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition"
          >
            등록
          </button>
        </div>

        {/* Comments Feed */}
        <div className="space-y-3">
          {episodeComments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
                    {comment.personaName.slice(0, 1)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{comment.personaName}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {comment.platform}
                    </span>
                    {comment.reactionTag && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        #{comment.reactionTag}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed pl-9">
                {comment.content}
              </p>

              <div className="flex items-center gap-3 text-[10px] text-slate-400 pl-9 pt-1">
                <span className="flex items-center gap-1 hover:text-brand-400 cursor-pointer">
                  <ThumbsUp className="w-3 h-3" /> {comment.likes}
                </span>
                <span>답글</span>
                <span>신고</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
