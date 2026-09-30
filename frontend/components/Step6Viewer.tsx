import React, { useState } from 'react';
import { NovelProjectState, PlatformType } from '../types';
import { BookOpen, Moon, Sun, Type, MessageSquare, ThumbsUp, Star, ChevronLeft, ChevronRight, Share2, Copy, Check } from 'lucide-react';

interface Step6Props {
  projectState: NovelProjectState;
}

export const Step6Viewer: React.FC<Step6Props> = ({ projectState }) => {
  const { episodes, drafts, comments, worldbuilding } = projectState;
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light' | 'oled'>('dark');
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [copied, setCopied] = useState(false);

  const currentEp = episodes.find((e) => e.id === selectedEpId) || episodes[0];
  const currentDraft = currentEp ? drafts[currentEp.id] : undefined;
  const epComments = comments.filter((c) => c.episodeId === currentEp?.id);

  const themeClasses = {
    dark: 'bg-zinc-950 text-zinc-200 border-zinc-800',
    sepia: 'bg-[#f4ecd8] text-[#433422] border-[#e2d5bc]',
    light: 'bg-white text-zinc-800 border-zinc-200',
    oled: 'bg-black text-zinc-100 border-zinc-900',
  };

  const handleCopyText = () => {
    if (!currentDraft?.content) return;
    navigator.clipboard.writeText(currentDraft.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIdx = episodes.findIndex((e) => e.id === currentEp?.id);
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Intro Header */}
      <div className="rounded-xl border border-violet-900/50 bg-gradient-to-r from-violet-950/40 to-indigo-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-600 text-white">
              Step 6
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">웹소설 시연 뷰어 (Viewer Simulation)</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            실제 네이버/카카오/노벨피아 뷰어 환경처럼 본문과 플랫폼별 연쇄 댓글을 열람합니다.
          </p>
        </div>

        {/* Viewer Style Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
          {/* Theme toggles */}
          <div className="flex items-center gap-1 border-r border-zinc-700 pr-2">
            <button
              onClick={() => setTheme('dark')}
              className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              title="다크 모드"
            >
              다크
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`px-2 py-1 text-xs rounded ${theme === 'sepia' ? 'bg-[#d8c7a5] text-zinc-900 font-bold' : 'text-zinc-400'}`}
              title="세피아 모드"
            >
              세피아
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-2 py-1 text-xs rounded ${theme === 'light' ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-400'}`}
              title="라이트 모드"
            >
              라이트
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 text-xs text-zinc-400 pl-1">
            <button
              onClick={() => setFontSize((s) => Math.max(13, s - 1))}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              가-
            </button>
            <span className="w-7 text-center font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              가+
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer ml-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Container */}
      <div className="max-w-3xl mx-auto rounded-2xl border overflow-hidden shadow-2xl transition-colors duration-200">
        {/* Viewer Top Nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-zinc-900/90 border-zinc-800 text-zinc-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <select
              value={currentEp?.id}
              onChange={(e) => setSelectedEpId(e.target.value)}
              className="rounded bg-zinc-950 border border-zinc-700 px-2.5 py-1 text-xs text-white font-medium"
            >
              {episodes.map((ep, idx) => (
                <option key={ep.id} value={ep.id}>
                  {ep.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-zinc-400 truncate max-w-[200px]">
            {worldbuilding.title}
          </div>
        </div>

        {/* Novel Text Body */}
        <article
          className={`p-6 sm:p-10 font-serif min-h-[480px] leading-relaxed transition-colors duration-200 ${themeClasses[theme]}`}
          style={{ fontSize: `${fontSize}px`, lineHeight }}
        >
          {/* Episode Title Header inside text */}
          <div className="text-center pb-8 mb-8 border-b border-zinc-800/40">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {currentEp?.title || '에피소드를 선택해 주세요'}
            </h1>
            <p className="text-xs opacity-60 font-sans">
              작가: 사에리버 (saeriver) · 조회수: 12,482 · 추천수: 1,429
            </p>
          </div>

          {/* Actual Novel Paragraphs */}
          {currentDraft?.content ? (
            <div className="space-y-4 whitespace-pre-wrap selection:bg-violet-600 selection:text-white">
              {currentDraft.content}
            </div>
          ) : (
            <div className="text-center py-20 opacity-50 font-sans text-sm">
              <p>아직 집필된 챕터 본문이 없습니다.</p>
              <p className="text-xs mt-1">Step 3(본문 집필)에서 [본문 AI 생성하기]를 진행하세요.</p>
            </div>
          )}

          {/* End of Chapter Note */}
          <div className="mt-16 pt-8 border-t border-zinc-800/40 text-center font-sans">
            <p className="text-xs opacity-60 mb-6">
              - {currentEp?.title} [完] -
            </p>

            {/* Episode Navigation Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={!prevEp}
                onClick={() => prevEp && setSelectedEpId(prevEp.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                이전화
              </button>
              <button
                disabled={!nextEp}
                onClick={() => nextEp && setSelectedEpId(nextEp.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-xs font-semibold text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
              >
                다음화
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="bg-zinc-950 border-t border-zinc-800 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">
                독자 댓글 ({epComments.length}개)
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-sans">추천순 정렬</span>
          </div>

          {epComments.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 font-sans">
              등록된 댓글이 없습니다. Step 5에서 [해당 회차 독자 댓글 생성]을 눌러보세요.
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              {epComments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{cmt.authorName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-violet-300 border border-violet-900/50">
                        {cmt.platform}
                      </span>
                      {cmt.rating && (
                        <div className="flex items-center text-amber-400 text-[10px]">
                          {'★'.repeat(cmt.rating)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{cmt.timestamp}</span>
                  </div>

                  <p className="text-zinc-200 leading-relaxed text-[13px]">{cmt.content}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <span className="text-[10px] text-zinc-600">신고 | 답글</span>
                    <div className="flex items-center gap-1.5 text-violet-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{cmt.upvotes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
