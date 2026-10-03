import React, { useState } from 'react';
import { NovelProjectState, PlatformType, EpisodeComment } from '../types';
import { BookOpen, Moon, Sun, Type, MessageSquare, ThumbsUp, Star, ChevronLeft, ChevronRight, Share2, Copy, Check, CornerDownRight, UserCheck } from 'lucide-react';

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

  const rootComments = epComments.filter((c) => !c.parentId);
  const repliesMap = epComments.reduce<Record<string, EpisodeComment[]>>((acc, cur) => {
    if (cur.parentId) {
      acc[cur.parentId] = acc[cur.parentId] || [];
      acc[cur.parentId].push(cur);
    }
    return acc;
  }, {});

  const themeClasses = {
    dark: 'bg-zinc-950 text-zinc-200 border-zinc-800',
    sepia: 'bg-[#f4ecd8] text-[#433422] border-[#e2d5bc]',
    light: 'bg-white text-zinc-800 border-zinc-200',
    oled: 'bg-black text-zinc-100 border-zinc-900',
  };

  const handleCopyText = () => {
    if (!currentDraft?.content) return;
    const plainText = currentDraft.content
      .replace(/<imagination>|<\/imagination>/g, '')
      .replace(/<reminiscence>|<\/reminiscence>/g, '');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIdx = episodes.findIndex((e) => e.id === currentEp?.id);
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  // ★ 사용자 요구사항:
  // 1) [작가의 상상] (<imagination>) - 튀지 않으면서도 은은하게 상상임을 구분
  // 2) [작가의 과거 회상] (<reminiscence>) - 과거를 되짚는 회상임을 가시적으로 단정하게 표기
  const renderFormattedNovelBody = (rawContent: string) => {
    if (!rawContent) return null;

    // <imagination> 및 <reminiscence> 태그를 모두 분할 파싱
    const parts = rawContent.split(/(<imagination>[\s\S]*?<\/imagination>|<reminiscence>[\s\S]*?<\/reminiscence>)/g);

    return parts.map((part, index) => {
      // 1. [작가의 상상] 블록
      if (part.startsWith('<imagination>') && part.endsWith('</imagination>')) {
        const imaginationText = part.replace('<imagination>', '').replace('</imagination>', '').trim();

        const imaginationBlockTheme = {
          dark: 'border-fuchsia-700/60 bg-fuchsia-950/20 text-fuchsia-200',
          sepia: 'border-[#b59a85] bg-[#ebd8c8]/40 text-[#543b2e]',
          light: 'border-fuchsia-300 bg-fuchsia-50/70 text-fuchsia-950',
          oled: 'border-fuchsia-800 bg-zinc-950 text-fuchsia-200',
        }[theme];

        return (
          <div
            key={index}
            className={`my-5 rounded-lg border-l-4 pl-4 pr-3 py-3 transition-colors ${imaginationBlockTheme}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium opacity-75 mb-1.5 select-none tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
              <span>[작가의 상상]</span>
            </div>
            <div className="italic leading-relaxed whitespace-pre-wrap opacity-95">
              {imaginationText}
            </div>
          </div>
        );
      }

      // 2. [작가의 과거 회상] 블록
      if (part.startsWith('<reminiscence>') && part.endsWith('</reminiscence>')) {
        const reminiscenceText = part.replace('<reminiscence>', '').replace('</reminiscence>', '').trim();

        const reminiscenceBlockTheme = {
          dark: 'border-cyan-700/60 bg-cyan-950/20 text-cyan-200',
          sepia: 'border-[#8ea4b0] bg-[#dbe5ea]/40 text-[#293d48]',
          light: 'border-cyan-300 bg-cyan-50/70 text-cyan-950',
          oled: 'border-cyan-800 bg-zinc-950 text-cyan-200',
        }[theme];

        return (
          <div
            key={index}
            className={`my-5 rounded-lg border-l-4 pl-4 pr-3 py-3 transition-colors ${reminiscenceBlockTheme}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium opacity-75 mb-1.5 select-none tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>[작가의 과거 회상]</span>
            </div>
            <div className="italic leading-relaxed whitespace-pre-wrap opacity-95">
              {reminiscenceText}
            </div>
          </div>
        );
      }

      // 3. 일반 서술 단락
      return (
        <div key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </div>
      );
    });
  };

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
            <strong>[작가의 상상]</strong> 및 <strong>[작가의 과거 회상]</strong>이 본문 속에서 단정하게 가시화되며, 독자 댓글 및 댓댓글을 실시간으로 열람합니다.
          </p>
        </div>

        {/* Viewer Style Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
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

          <div className="flex items-center gap-1 text-xs text-zinc-400 pl-1">
            <button
              onClick={() => setFontSize((s) => Math.max(13, s - 1))}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              가-
            </button>
            <span className="w-7 text-center font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
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
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  [{ep.part || 1}부] {drafts[ep.id]?.episodeTitle || ep.title}
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
          <div className="text-center pb-8 mb-8 border-b border-zinc-800/40">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {currentDraft?.episodeTitle || currentEp?.title || '에피소드를 선택해 주세요'}
            </h1>
            <p className="text-xs opacity-60 font-sans">
              작가: 손세미 · 회차: [{currentEp?.part || 1}부] Stage {currentEp?.stageNumber} · 조회수: 14,892 · 추천수: 2,140
            </p>
          </div>

          {currentDraft?.content ? (
            <div className="space-y-4 selection:bg-violet-600 selection:text-white">
              {renderFormattedNovelBody(currentDraft.content)}
            </div>
          ) : (
            <div className="text-center py-20 opacity-50 font-sans text-sm">
              <p>아직 집필된 챕터 본문이 없습니다.</p>
              <p className="text-xs mt-1">Step 3(본문 집필)에서 [본문 및 제목 AI 생성하기]를 진행하세요.</p>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-zinc-800/40 text-center font-sans">
            <p className="text-xs opacity-60 mb-6">
              - {currentDraft?.episodeTitle || currentEp?.title} [完] -
            </p>

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

          {rootComments.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 font-sans">
              등록된 댓글이 없습니다. Step 5에서 [본문 완독 댓글 생성] 및 [댓글 대화 생성]을 눌러보세요.
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {rootComments.map((cmt) => {
                const isAcquaintance = cmt.platform === 'Acquaintance';
                const replies = repliesMap[cmt.id] || [];

                return (
                  <div key={cmt.id} className="space-y-2">
                    <div
                      className={`rounded-xl border p-4 space-y-2 text-xs ${
                        isAcquaintance ? 'border-amber-700/60 bg-amber-950/20' : 'border-zinc-800/80 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white flex items-center gap-1">
                            {isAcquaintance && <UserCheck className="w-3 h-3 text-amber-400" />}
                            {cmt.authorName}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isAcquaintance ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-zinc-800 text-violet-300 border border-violet-900/50'
                          }`}>
                            {isAcquaintance ? '교회 지인' : cmt.platform}
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
                        <span className="text-[10px] text-zinc-600">답글 {replies.length}개</span>
                        <div className="flex items-center gap-1.5 text-violet-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{cmt.upvotes}</span>
                        </div>
                      </div>
                    </div>

                    {/* 대댓글 렌더링 */}
                    {replies.length > 0 && (
                      <div className="pl-6 space-y-2 border-l-2 border-violet-800/30 ml-4">
                        {replies.map((rep) => (
                          <div
                            key={rep.id}
                            className={`rounded-lg border p-3 text-xs space-y-1 ${
                              rep.platform === 'Acquaintance' ? 'border-amber-800/40 bg-amber-950/30' : 'border-zinc-800 bg-zinc-900/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-violet-400" />
                                <span className="font-bold text-white text-[11px]">{rep.authorName}</span>
                                {rep.replyToAuthor && (
                                  <span className="text-[10px] text-violet-300 font-mono">
                                    @{rep.replyToAuthor}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-zinc-500">{rep.timestamp}</span>
                            </div>
                            <p className="text-[12px] text-zinc-300 pl-4 leading-relaxed">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
