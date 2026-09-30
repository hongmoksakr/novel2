import React, { useState } from 'react';
import { Lock, Sparkles, BookOpen, KeyRound, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (userId.trim() === 'saeriver' && password.trim() === '1228') {
        sessionStorage.setItem('knovel_auth', 'authenticated');
        onSuccess();
      } else {
        setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleQuickFill = () => {
    setUserId('saeriver');
    setPassword('1228');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl shadow-violet-950/40 text-zinc-100">
        {/* Glow Header */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center w-24 h-24 rounded-full bg-violet-600/20 border border-violet-500/30 blur-sm pointer-events-none" />
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-600/40 mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            K-Web Novel Studio <Sparkles className="w-5 h-5 text-violet-400" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            창작 스튜디오 접근을 위한 인증이 필요합니다
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-800/80 px-3 py-2.5 text-xs text-red-200 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              사용자 ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="saeriver"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-all mt-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            {isLoading ? '인증 확인 중...' : '스튜디오 입장하기'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-violet-400 hover:text-violet-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            테스트 계정 자동 입력
          </button>
          <span>ID: saeriver / PW: 1228</span>
        </div>
      </div>
    </div>
  );
};
