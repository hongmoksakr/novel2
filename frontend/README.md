# StoryForge AI - 웹소설 창작 스튜디오

## 🌐 배포 후 접속 주소 (어떤 파일로 접속하나요?)

GitHub Pages에 배포한 후에는 **특정 파일(.html이나 .tsx)을 직접 열지 않고**, GitHub이 자동으로 발급해 주는 **웹사이트 도메인 주소(URL)**로 접속하시면 됩니다. (웹 서버가 자동으로 `index.html`을 실행합니다.)

---

### 1. 내 웹사이트 접속 주소 형식
```text
https://<깃허브_사용자아이디>.github.io/<저장소_이름>/
```
* 예시: 아이디가 `honggildong`이고 저장소 이름이 `storyforge`라면:
  👉 **`https://honggildong.github.io/storyforge/`** 로 접속하시면 됩니다.

---

### 2. 접속 링크 바로 찾는 3가지 방법

#### 방법 1: 저장소 메인 화면 우측 사이드바 (가장 빠름)
1. GitHub 저장소의 메인 코드 화면(`Code` 탭)으로 갑니다.
2. 화면 오른쪽 하단의 **Deployments** 섹션을 확인합니다.
3. **`github-pages`** 항목 아래에 생성된 링크를 클릭하면 즉시 앱이 열립니다.

#### 방법 2: [Settings] 메뉴에서 확인
1. 저장소 상단의 **[Settings]** 탭 클릭
2. 왼쪽 사이드바 메뉴에서 **[Pages]** 클릭
3. 상단에 초록색 체크와 함께 표시되는 주소 확인:
   > *"Your site is live at `https://<아이디>.github.io/<저장소이름>/`"*
4. **Visit site** 버튼을 누르면 바로 접속됩니다.

#### 방법 3: [Actions] 탭에서 확인
1. 저장소 상단의 **[Actions]** 탭 클릭
2. 가장 최근에 성공한 **`Deploy to GitHub Pages`** 작업 클릭
3. 화면 속 **`deploy`** 단계 아래에 적힌 공식 URL 클릭

---

### ⚠️ 배포 직후 접속 시 주의사항
1. **GitHub Pages Source 설정 확인**:
   - `Settings` -> `Pages` -> `Build and deployment` -> `Source`가 **`GitHub Actions`**로 선택되어 있어야 합니다.
2. **배포 소요 시간**:
   - 코드를 푸시한 뒤 GitHub Actions가 빌드를 완료할 때까지 **약 1~2분** 정도 소요됩니다. 초록색 체크(`✓`)가 뜬 뒤 접속하세요.
3. **최초 로그인**:
   - 앱에 접속하면 보안 게이트가 열립니다. 임의의 아이디/비밀번호를 입력하거나, 하단의 **[빠른 데모 계정 자동 입력]**을 누르고 입장하시면 됩니다.

---

### 💻 내 컴퓨터(로컬)에서 직접 실행할 때
```bash
npm install
npm run dev
```
실행 후 브라우저에서 `http://localhost:5173`으로 접속하시면 됩니다.
