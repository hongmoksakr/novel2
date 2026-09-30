import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface AuthLockScreenProps {
  onLoginSuccess: (userId: string) => void;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해야 스튜디오에 입장할 수 있습니다.');
      return;
    }

    // Allow user entry and save session
    sessionStorage.setItem('storyforge_auth_user', trimmedUser);
    onLoginSuccess(trimmedUser);
  };

  const handleQuickDemo = () => {
    setUsername('writer_church');
    setPassword('holy1234');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-red-900/10 rounded-full blur-3xl pointer-events-none translate-x-32 translate-y-32" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100">
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-brand-400 uppercase">
              STUDIO SECURITY ACCESS
            </span>
            <h1 className="text-xl font-black text-white mt-0.5">StoryForge AI 보안 게이트</h1>
            <p className="text-xs text-slate-400 mt-1">
              집필 원고 보안을 위해 아이디와 비밀번호를 입력해주세요.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              작가 아이디 (ID)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMsg('');
              }}
              placeholder="작가 아이디 입력"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              비밀번호 (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="비밀번호 입력"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 text-sm transition transform active:scale-[0.98]"
          >
            <span>스튜디오 입장하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-xs text-slate-400 hover:text-brand-300 transition underline underline-offset-4"
          >
            빠른 데모 계정 자동 입력
          </button>
        </div>
      </div>
    </div>
  );
};
