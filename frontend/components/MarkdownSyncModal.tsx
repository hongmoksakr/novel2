import React, { useState, useRef } from 'react';
import { NovelSettings, Episode, CommenterPersona, EpisodeComment, ProjectFullData } from '../types';
import { serializeProjectToMarkdown, parseProjectFromMarkdown } from '../utils/markdownParser';
import { 
  Download, Upload, FileText, Check, AlertCircle, 
  X, Copy, RefreshCw, Sparkles, FileDown, FileUp 
} from 'lucide-react';

interface MarkdownSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NovelSettings;
  episodes: Episode[];
  personas: CommenterPersona[];
  comments: EpisodeComment[];
  onImportSuccess: (data: ProjectFullData) => void;
}

export const MarkdownSyncModal: React.FC<MarkdownSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  episodes,
  personas,
  comments,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [rawMarkdownText, setRawMarkdownText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const exportedMarkdown = serializeProjectToMarkdown(settings, episodes, personas, comments);

  const handleDownloadFile = () => {
    const filename = `${settings.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_원고.md`;
    const blob = new Blob([exportedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(exportedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawMarkdownText(content);
        executeImport(content);
      }
    };
    reader.readAsText(file);
  };

  const executeImport = (text: string) => {
    const parsed = parseProjectFromMarkdown(text);
    if (!parsed) {
      setImportStatus({
        success: false,
        message: '유효한 StoryForge 마크다운 원고 데이터 블록을 찾을 수 없습니다. 정상적으로 내보낸 .md 파일인지 확인해주세요.'
      });
      return;
    }

    onImportSuccess(parsed);
    setImportStatus({
      success: true,
      message: `성공적으로 원고를 불러왔습니다! (${parsed.settings.title} / 에피소드 ${parsed.episodes.length}개 / 댓글 ${parsed.comments.length}개 복원)`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">마크다운(.md) 통합 저장 & 불러오기</h2>
              <p className="text-xs text-slate-400">1~6단계의 모든 설정, 12단계 플롯, 본문, 댓글러 페르소나 및 정주행 댓글을 완벽히 복원합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>마크다운 파일로 저장 (.md)</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>마크다운 파일 불러와서 이어쓰기</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">전체 원고 및 메타데이터 직렬화 완료</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    작품 기본 설정, 영웅의 여정 에피소드 본문, 댓글러 10인 페르소나 및 정주행 댓글 데이터가 포함되어 있습니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨!' : '클립보드 복사'}</span>
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-brand-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.md 파일 다운로드</span>
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">마크다운 문서 미리보기</label>
                <textarea
                  readOnly
                  rows={14}
                  value={exportedMarkdown}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Upload Trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-brand-500 bg-slate-950/60 rounded-2xl p-8 text-center space-y-2 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-brand-600/20 group-hover:border-brand-500 flex items-center justify-center mx-auto text-slate-400 group-hover:text-brand-400 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">이곳을 클릭하여 .md 파일을 업로드하세요</h4>
                <p className="text-xs text-slate-400">StoryForge에서 저장했던 .md 파일을 선택하면 원고 전체가 복원됩니다.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".md,.txt,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Paste Text directly */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  또는 마크다운 텍스트를 직접 아래에 붙여넣기
                </label>
                <textarea
                  rows={8}
                  value={rawMarkdownText}
                  onChange={(e) => setRawMarkdownText(e.target.value)}
                  placeholder="다운로드받았던 .md 원고 내용 전문을 여기에 붙여넣으세요..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    importStatus.success
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  {importStatus.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => executeImport(rawMarkdownText)}
                  disabled={!rawMarkdownText.trim()}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-xs font-bold rounded-xl text-white shadow-lg transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>원고 데이터 복원하고 이어쓰기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
