import React, { useRef } from 'react';
import { Download, Upload, BookMarked, Sparkles, LogOut, CheckCircle } from 'lucide-react';
import { NovelProjectState } from '../types';

interface HeaderProps {
  projectState: NovelProjectState;
  onImportState: (newState: NovelProjectState) => void;
  onLogout: () => void;
  savedNotification: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projectState,
  onImportState,
  onLogout,
  savedNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export to structured .md file with JSON Frontmatter block
  const handleExportMarkdown = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const stateWithTime = {
      ...projectState,
      savedAt: new Date().toISOString(),
    };

    const frontmatter = `---
type: knovel-studio-project
version: "${projectState.version}"
savedAt: "${stateWithTime.savedAt}"
title: "${projectState.worldbuilding.title}"
---`;

    const jsonPayload = `<!-- K_WEBNOVEL_STUDIO_STATE_START
${JSON.stringify(stateWithTime, null, 2)}
K_WEBNOVEL_STUDIO_STATE_END -->`;

    const readableContent = `
# 📖 [K-웹소설 프로젝트] ${projectState.worldbuilding.title}

## 1. 세계관 및 캐릭터 설정 (Worldbuilding)
- **장르 태그**: ${projectState.worldbuilding.tags.join(', ')}
- **남성 주인공**: ${projectState.worldbuilding.maleLead.name} (${projectState.worldbuilding.maleLead.age}) - ${projectState.worldbuilding.maleLead.role}
  - 성격 및 지배 성향: ${projectState.worldbuilding.maleLead.personality}
  - 특성: ${projectState.worldbuilding.maleLead.hiddenTrait}
- **여성 주인공**: ${projectState.worldbuilding.femaleLead.name} (${projectState.worldbuilding.femaleLead.age}) - ${projectState.worldbuilding.femaleLead.role}
  - 성격 및 피학 성향: ${projectState.worldbuilding.femaleLead.personality}
  - 비밀 욕망: ${projectState.worldbuilding.femaleLead.secretDesire}
- **문체 및 시점**: ${projectState.worldbuilding.toneStyle} / ${projectState.worldbuilding.pov}

---

## 2. 영웅의 여정 플롯 및 에피소드 구성
${projectState.episodes.map(ep => `
### [Stage ${ep.stageNumber}] ${ep.title}
- **개요**: ${ep.outline}
- **갈등**: ${ep.keyConflict}
- **클라이맥스**: ${ep.climaxPoint}
`).join('\n')}

---

## 3. 집필된 챕터 본문 (Drafts)
${Object.entries(projectState.drafts).map(([id, draft]) => `
### ${draft.episodeTitle} (수위: ${draft.sensualIntensity} / 분량: ${draft.volume})
${draft.content}
`).join('\n\n---\n\n')}

---

## 4. 독자 페르소나 및 댓글 기록
${projectState.comments.map(c => `
- **[${c.platform}] ${c.authorName}** (👍 ${c.upvotes}): ${c.content}
`).join('\n')}
`;

    const fullMarkdown = `${frontmatter}\n\n${jsonPayload}\n\n${readableContent}`;
    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webnovel_project_${projectState.worldbuilding.title.replace(/\s+/g, '_')}_${timestamp}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import from .md file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const match = text.match(/<!-- K_WEBNOVEL_STUDIO_STATE_START\s*([\s\S]*?)\s*K_WEBNOVEL_STUDIO_STATE_END -->/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]) as NovelProjectState;
          onImportState(parsed);
          alert(`성공적으로 프로젝트 [${parsed.worldbuilding?.title || '작품'}]를 불러왔습니다!`);
        } else {
          alert('올바른 K-Web Novel 프로젝트 마크다운 형식이 아닙니다.');
        }
      } catch (err) {
        console.error('Failed to parse md project', err);
        alert('파일을 파싱하는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Active Novel Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-violet-900/40">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">K-Web Novel Studio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono">v1.2 PRO</span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[220px] sm:max-w-xs md:max-w-md">
              현재 집필: <span className="text-zinc-200 font-medium">{projectState.worldbuilding.title}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {savedNotification && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>동기화 완료</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".md,.markdown"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors shadow-sm cursor-pointer"
            title="마크다운 프로젝트 파일 (.md) 불러오기"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">프로젝트 불러오기</span>
            <span className="sm:hidden">불러오기</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-900/30 transition-all cursor-pointer"
            title="현재 전체 프로젝트 상태를 Markdown (.md)으로 저장"
          >
            <Download className="w-3.5 h-3.5" />
            <span>마크다운으로 저장</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
