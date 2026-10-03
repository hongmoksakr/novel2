import { WorldbuildingState, EpisodeCard, CommenterPersona, ArchetypeRole } from './types';

export const ARCHETYPE_DESCRIPTIONS: Record<ArchetypeRole, { name: string; desc: string; narrativeRole: string }> = {
  '영웅': {
    name: '영웅 (Hero / Foil)',
    desc: '외적으로는 이상적인 모범 청년/신도이나 내적으로 뒤틀린 대조군 인물',
    narrativeRole: '주인공들의 타락과 쾌락을 더 돋보이게 하거나 도덕적 규범의 잣대로 작동'
  },
  '조력자': {
    name: '조력자 (Mentor / Ally)',
    desc: '통찰이나 계기를 제공하거나 은밀히 관계를 돕거나 묵인하는 동조자',
    narrativeRole: '주인공에게 시험의 도구를 쥐여주거나 감춰진 욕망을 일깨우며 밀회를 가능케 함'
  },
  '문턱 수호자': {
    name: '문턱 수호자 (Threshold Guardian)',
    desc: '새로운 금기의 선을 넘지 못하도록 가로막고 규율로 시험하는 감시자',
    narrativeRole: '교회 평판 감시, 사생활 검문 등으로 아슬아슬한 발각의 스릴과 긴장을 유발'
  },
  '전령': {
    name: '전령 (Herald)',
    desc: '안온한 일상을 깨뜨릴 충격적인 소식, 수련회 일정, 계기를 전달하는 메신저',
    narrativeRole: '새로운 씬과 폐쇄된 공간(기도원, 밀실 등)으로 주인공들을 몰아넣음'
  },
  '변신자': {
    name: '변신자 (Shapeshifter)',
    desc: '아군인지 적인지 정체를 알 수 없어 주인공을 흔들고 의심을 낳는 인물',
    narrativeRole: '위선과 순수함 사이를 오가며 주인공들의 비밀을 쥐고 흔드는 위험 요소'
  },
  '그림자': {
    name: '그림자 (Shadow)',
    desc: '주인공의 억눌린 본능과 죄책감을 극단적으로 투영하거나 대립하는 적대자',
    narrativeRole: '사회적 명예를 파괴할 수 있는 권력자 또는 과거의 억압 요인'
  },
  '책략가': {
    name: '책략가 (Trickster)',
    desc: '진지한 규율을 비웃고 규칙의 허점을 찔러 돌발 상황을 만드는 인물',
    narrativeRole: '둘만의 은밀한 침묵을 갑작스럽게 깨뜨리며 위기를 가속화함'
  }
};

export const CAMPBELL_16_STAGES = [
  { stage: 1, title: '1. 일상 세계 (The Ordinary World)', desc: '평온한 겉모습 뒤에 억압된 결핍이 공존하는 일상적 배경' },
  { stage: 2, title: '2. 모험에의 부름 (The Call to Adventure)', desc: '일탈과 은밀한 유혹의 계기가 발생하는 충격적 조우' },
  { stage: 3, title: '3. 부름의 거절 (Refusal of the Call)', desc: '도덕적 죄의식, 체면, 종교적 규율로 인한 내적 망설임' },
  { stage: 4, title: '4. 스승과의 만남 (Meeting the Mentor)', desc: '통찰을 주거나 혹은 왜곡된 지배/훈육을 가르치는 상대와의 밀착' },
  { stage: 5, title: '5. 첫 관문 통과 (Crossing the Threshold)', desc: '되돌릴 수 없는 금기의 선을 넘는 비밀스러운 굴복의 서약' },
  { stage: 6, title: '6. 시험과 동료 (Tests and Allies)', desc: '주변인들의 시선과 의심, 공동체 속에서의 은밀한 밀회' },
  { stage: 7, title: '7. 적수의 출현 (Enemies Emerging)', desc: '관계를 위협하는 감시자와 평판의 엄격한 압박 조우' },
  { stage: 8, title: '8. 가장 깊은 동굴로의 접근 (Approach Inmost Cave)', desc: '숨겨진 진실이나 농밀한 욕망이 정점에 달하는 폐쇄된 격리 공간' },
  { stage: 9, title: '9. 중대한 시련 (The Central Ordeal)', desc: '신분 파탄 직전의 전율, 본능의 완전한 굴복과 수치심 극대화' },
  { stage: 10, title: '10. 보상 / 쾌락의 장악 (The Reward)', desc: '절대적 지배와 피학적 쾌락의 완전한 획득, 해방감' },
  { stage: 11, title: '11. 발각의 위기와 반격 (Danger of Exposure)', desc: '현실의 추궁과 사회적 처벌의 엄습으로 인한 파열' },
  { stage: 12, title: '12. 귀환의 길 (The Road Back)', desc: '관계의 은폐와 공모, 더 대담해지는 통제와 의존' },
  { stage: 13, title: '13. 절체절명의 결단 (The Ultimate Climax)', desc: '모든 체면을 벗어던지고 서로의 관계를 영구히 각인하는 절정' },
  { stage: 14, title: '14. 부활과 정착 (Resurrection)', desc: '기존의 자아를 완전히 파괴하고 지배-피지배 관계로 다시 태어남' },
  { stage: 15, title: '15. 새로운 질서 (The New Order)', desc: '사회적 가면을 완벽히 쓰고 둘만의 밀실 규율을 완성' },
  { stage: 16, title: '16. 영약과 지속 (The Elixir & Continuation)', desc: '겉으로는 모범적인 사제와 성도, 은밀하게는 영원한 복종의 일상화' },
];

export const INITIAL_WORLDBUILDING: WorldbuildingState = {
  title: '안녕하세요, 청순한 여교사 손세미입니다',
  tags: ['사제지간', '연상녀연하남', '개신교회 연애물', '메조히스트여성', '조교물'],
  targetAudience: '20-30대 고수위 피폐·배덕 로맨스 독자층',
  parts: [
    {
      partNumber: 1,
      title: '1부: 은혜와 계율의 성가대실',
      description: '청순한 여교사 손세미와 연하 사역자의 첫 만남, 그리고 시작되는 서늘한 통제',
      partInstruction: '1부 전체는 성가대실과 닫힌 문 뒤에서 벌어지는 조용한 훈육을 중심으로, 청순한 고등학교 교사 손세미가 여덟 살 어린 최창환 전도사 앞에서는 턱을 들린 채 무릎 꿇고 마는 서늘한 피학적 전율을 타겟 독자층에게 귓속말하듯 직접 말을 건네며 묘사할 것.'
    },
    {
      partNumber: 2,
      title: '2부: 닫힌 사택과 심야의 고해',
      description: '교회 공동체의 시선을 피해 더 깊은 쾌락과 굴복으로 침잠하는 관계',
      hiatusDuration: '3개월',
      partInstruction: '2부 전체는 심야 사택과 비공개 기도실의 폐쇄성을 극대화하여, 둘의 성애 장면을 한 치의 거짓 없이 한층 더 천박하고 질척이며 음탕하게 서술하고, 타겟 독자층에게 관음적 공범의 심리를 자극하는 방백 어조를 일관되게 유지할 것.'
    }
  ],
  maleLead: {
    name: '',
    age: '',
    role: '',
    personality: '',
    appearance: '',
    speechStyle: ''
  },
  femaleLead: {
    name: '',
    age: '',
    role: '',
    personality: '',
    appearance: '',
    speechStyle: ''
  },
  supportingCharacters: [
    {
      id: 'supp-1',
      name: '박진철 목사',
      archetype: '그림자',
      role: '담임목사 (50대 후반)',
      relationship: '사역자를 후계자처럼 아끼는 영적 멘토이자 권위적 감시자',
      notes: '교회의 명예와 경건을 극도로 중시하며, 작은 소문도 용납하지 않는 보수적 인물.',
      appearingParts: [1, 2]
    },
    {
      id: 'supp-2',
      name: '한지원',
      archetype: '문턱 수호자',
      role: '청년부 회장 (27세)',
      relationship: '손세미를 흠모하고 동경하는 교회 청년',
      notes: '손세미와 최창환 사이에 흐르는 서늘하고 은밀한 기류를 가장 먼저 의심하며 주위를 맴돔.',
      appearingParts: [1]
    },
    {
      id: 'supp-3',
      name: '정순옥 권사',
      archetype: '책략가',
      role: '성가대 총무 권사 (60대)',
      relationship: '교회 내 소문과 평판의 발원지',
      notes: '예배당 구석구석을 감시하며 성가대원들의 사생활을 간섭하는 감시자.',
      appearingParts: [1, 2]
    }
  ],
  toneStyle: '배덕감 어린 긴장감, 종교적 경건함과 농밀한 관능미의 대조, 섬세한 심리 묘사 및 탐닉적 문체.',
  mainSetting: '도심 외곽 주사랑 개신교회 (성가대실 피아노 앞, 인적 드문 자모실, 지하 기도실 및 사택)',
  eventPov: '1인칭 주인공 시점 (손세미 시점) 및 3인칭 전지적 시점 교차',
  eventYear: '2019',
  writingYear: '2024',
  writingTense: '과거형 위주의 긴장감 있는 어조 (회고체 결합)',
  primaryTropes: ['사제지간', '연상녀연하남', '개신교회 연애물', '메조히스트여성', '조교물']
};

export const INITIAL_EPISODES: EpisodeCard[] = [
  {
    id: 'ep-1',
    part: 1,
    stageNumber: 1,
    subNumber: 1,
    title: '제1화: 성가대실의 닫힌 문',
    outline: '비 내리는 수요일 저녁, 텅 빈 예배당 성가대실에서 홀로 연습하던 손세미에게 새로 부임한 젊은 전도사 최창환이 조용히 다가온다. 악보를 짚어주는 그의 손끝에서 서늘한 긴장이 맴돈다.',
    keyConflict: '청순한 교사라는 사회적 체면 뒤에 숨겨진 손세미의 억눌린 피학적 충동, 이를 꿰뚫어 보는 최창환의 시선.',
    climaxPoint: '최창환이 손세미의 흐트러진 호흡을 지적하며 턱을 들어 올리는 순간, 손세미의 심장이 멎을 듯 요동친다.'
  },
  {
    id: 'ep-2',
    part: 1,
    stageNumber: 2,
    subNumber: 1,
    title: '제2화: 고해(告解) 아닌 훈육',
    outline: '최창환은 손세미에게 특별 성경 공부를 제안하고, 인적이 드문 자모실로 부른다. 손세미가 평소 느끼던 공허함과 죄책감을 짚어내며 심리적인 거리를 좁혀온다.',
    keyConflict: '사역자와 성도라는 위계, 연상과 연하라는 나이 차이 사이에서 뒤틀리는 복종의 징후.',
    climaxPoint: '“선생님, 기도는 그렇게 고개를 빳빳이 들고 하는 게 아닙니다.” 손세미의 무릎을 바닥에 닿게 누르는 최창환의 차가운 목소리.'
  },
  {
    id: 'ep-3',
    part: 1,
    stageNumber: 5,
    subNumber: 1,
    title: '제3화: 첫 번째 계명',
    outline: '교회 수련회 답사지인 한적한 기도원. 최창환은 문을 걸어 잠그고 손세미에게 첫 번째 징벌과 복종의 규칙을 하달한다.',
    keyConflict: '신앙의 규율을 역이용한 지배와, 수치심 속에서 터져 나오는 손세미의 은밀한 쾌락.',
    climaxPoint: '손목이 묶인 채 그의 가르침을 입으로 되뇌는 손세미의 굴복.'
  }
];

export const INITIAL_PERSONAS: CommenterPersona[] = [
  {
    id: 'p-1',
    name: '새벽기도3년차_원덬',
    platform: 'Theqoo',
    age: '20대 후반',
    gender: '여성',
    personality: '더쿠 로맨스소설방 상주 고인물, 격한 오열과 주접, 앓는 소리와 대가리 깨며 과몰입하는 전형적 더쿠 유저',
    commentTone: '아 미친거아냐???ㅠㅠㅠㅠㅠㅠㅠ 아니 진짜 원덬이 지금 심장 부여잡고 대가리 팍팍 깨는 중임 하... 남주 존댓말로 서늘하게 턱 치켜올리는 거 보고 입틀막함;; 손세미 쌤 숨소리 파르르 떨릴 때 나만 온몸에 소름 돋음? 도파민 도라방스다 진짜 오늘 밤 다 샜음 작가님 제발 연참 좀ㅠㅠㅠㅠㅠㅠ',
    avatarSeed: 'amber',
  },
  {
    id: 'p-2',
    name: '챈주_성경투척러',
    platform: 'ArcaLive',
    age: '20대 초반',
    gender: '남성',
    personality: '아카라이브 챈 상주 이대남, 매운맛 도파민 추구, 음슴체와 알파메일 참교육 밈 구사',
    commentTone: '캬ㅋㅋ 전도사쉑 피아노 덮개 닫으면서 무릎 꿇리는 거 알파메일력 GOAT네 ㄹㅇㅋㅋ 청순여교사 바로 암컷타락 각 섰음 개추를 참을 수가 없노 다음화 연참 안 달리면 작가 집 찾아감',
    avatarSeed: 'cyan',
  },
  {
    id: 'p-3',
    name: '청년부_교회목격자',
    platform: 'Acquaintance',
    age: '20대 후반',
    gender: '남성',
    personality: '손세미와 최창환을 아는 같은 교회 사람, 손세미에 대한 걱정 따윈 전혀 없고 그녀의 숨겨진 음탕한 면모에 대한 노골적 흥분과 성적 관음증에 미쳐있는 지인',
    commentTone: '와 미쳤다 진짜... 주일마다 단정하게 성가대 가운 입고 거룩한 척 찬양하던 손세미 쌤이 성가대실 닫힌 문 뒤에서 최창환 전도사 무릎 아래 꿇려져서 헐떡거렸다고 생각하니까 발기할 것 같음 ㄷㄷ 예배 때 둘이 마주치던 게 이 짓거리 복선이었냐? 세미 쌤 진짜 상상 이상으로 음탕하고 발칙한 여자였네 존나 꼴린다 ㅋㅋㅋ 다음 화 사택 씬 제발 더 노골적으로 풀어줘',
    avatarSeed: 'rose',
  },
  {
    id: 'p-4',
    name: '달콤한배덕',
    platform: 'RidiBooks',
    age: '30대 초반',
    gender: '여성',
    personality: '정통 피폐 로설 애독자, 서평식 감상과 별점 관리',
    commentTone: '★★★★★ 사제지간 클리셰를 이렇게 배덕하고 우아하게 풀다니... 여주의 은밀한 결핍을 정확하게 파고드는 남주의 통제력이 압권입니다.',
    avatarSeed: 'violet',
  }
];
