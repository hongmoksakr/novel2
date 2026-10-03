# 📖 K-Web Novel Studio (GitHub Pages 배포 가이드)

본 애플리케이션은 **Node.js/Express 백엔드 서버가 전혀 필요 없는 100% 순수 클라이언트 React SPA (Single Page Application)** 입니다.
모든 데이터 저장(Markdown 내보내기/불러오기, LocalStorage 동기화)과 상태 관리가 사용자의 브라우저 내에서 직접 구동되므로, **GitHub Pages**에 즉시 무료 정적 호스팅이 가능합니다.

---

## 🚀 GitHub Pages 배포 방법 (2가지 중 택 1)

### 방법 A. 무설치 정적 배포 (가장 빠름)
1. 본 레포지토리의 파일들(`index.html`, `index.tsx`, `App.tsx`, `components/`, `services/` 등)을 그대로 GitHub 레포지토리에 푸시합니다.
2. GitHub 레포지토리 **Settings** > **Pages**로 이동합니다.
3. **Build and deployment** 항목의 Source를 `Deploy from a branch`로 설정하고 `main` 브랜치의 `/ (root)`를 지정 후 **Save**를 누릅니다.
4. 약 1분 후 제공되는 GitHub Pages URL에서 서버 없이 즉시 작동합니다.

### 방법 B. Vite 정적 빌드 배포
1. 패키지 설치:
   ```bash
   npm install
   ```
2. 빌드 실행 (`dist` 단일 정적 폴더 생성):
   ```bash
   npm run build
   ```
3. GitHub Pages로 배포:
   ```bash
   npm run deploy
   ```

---

## 🔒 로컬 보안 인증
- **아이디**: `saeriver`
- **비밀번호**: `1228`
- 브라우저 세션 스토리지를 통해 인증 상태가 유지됩니다.

## 💾 오프라인 & 클라이언트 완벽 호환
- Gemini API 키(`process.env.API_KEY`)가 환경에 주입되어 있으면 초지능 Gemini 2.5 Flash를 직접 호출합니다.
- API 키가 없는 정적 호스팅 환경에서도 앱이 멈추거나 꺼지지 않으며, 내장된 **지능형 클라이언트 서사 엔진**을 통해 본문 집필, [작가의 상상], [과거 회상], 더쿠/아카라이브/교회지인의 다채로운 연쇄 댓글 및 댓댓글 티키타카가 100% 오프라인으로 매끄럽게 작동합니다.
