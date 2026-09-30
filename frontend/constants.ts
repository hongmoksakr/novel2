import { WorldbuildingState, EpisodeCard, CommenterPersona } from './types';

export const CAMPBELL_STAGES = [
  { stage: 1, title: '1. 일상 세계 (The Ordinary World)', desc: '주인공의 평범하지만 결핍이나 억압이 존재하는 일상 환경' },
  { stage: 2, title: '2. 모험에의 부름 (The Call to Adventure)', desc: '일상을 깨뜨리는 충격적인 유혹이나 사건, 위험한 계기 발생' },
  { stage: 3, title: '3. 부름의 거절 (Refusal of the Call)', desc: '도덕적 죄책감, 신앙적 갈등, 두려움으로 인한 망설임과 회피' },
  { stage: 4, title: '4. 스승과의 만남 (Meeting the Mentor)', desc: '통찰을 주거나 혹은 왜곡된 지배/가르침을 전수하는 상대와의 조우' },
  { stage: 5, title: '5. 첫 관문 통과 (Crossing the First Threshold)', desc: '더는 돌이킬 수 없는 선을 넘음, 비밀스러운 금기의 서약' },
  { stage: 6, title: '6. 시험, 동료, 적수 (Tests, Allies, Enemies)', desc: '폐쇄된 공동체 내의 감시, 주변인들의 의심, 관계의 밀월과 갈등' },
  { stage: 7, title: '7. 가장 깊은 동굴로의 접근 (Approach to the Inmost Cave)', desc: '숨겨진 진실이나 농밀한 욕망이 정점에 달하는 격리된 공간' },
  { stage: 8, title: '8. 가혹한 시련과 위기 (The Ordeal)', desc: '신분 파탄의 위기, 발각 직전의 전율, 본능의 완전한 굴복' },
  { stage: 9, title: '9. 보상 / 영검 획득 (Reward / Seizing the Sword)', desc: '서로에 대한 완전한 정신적·육체적 소유권 획득, 해방감' },
  { stage: 10, title: '10. 귀환의 길 (The Road Back)', desc: '현실의 압박과 교회 공동체의 추궁, 관계의 공개적 위기' },
  { stage: 11, title: '11. 부활과 절정 (The Resurrection)', desc: '사회적 시선을 완전히 부수고 오롯이 서로의 지배-복종을 완성' },
  { stage: 12, title: '12. 영약을 품은 귀환 (Return with the Elixir)', desc: '겉으로는 경건한 사제와 신도, 은밀하게는 절대적인 구원과 탐닉의 정착' },
];

export const INITIAL_WORLDBUILDING: WorldbuildingState = {
  title: '은혜 아래의 사제 (Grace & Submission)',
  tags: ['사제지간', '연상녀연하남', '교회로맨스', '메조히스트', '조교물', '배덕감', '고수위'],
  maleLead: {
    name: '강태하',
    age: '24세 (연하남)',
    role: '신학대학원생 / 청년부 사역자 (전도사)',
    personality: '단정하고 온화한 미소 뒤에 집착과 냉철한 지배욕을 감춘 인물. 경건한 겉모습과 달리 그녀를 오직 자신의 말씀 아래 무릎 꿇리고 싶어 한다.',
    appearance: '검은 셔츠와 흰 깃이 어울리는 단정한 이목구비, 핏줄이 도드라진 하얀 손, 깊고 서늘한 눈매.',
    hiddenTrait: '철저한 규율주의자이자 주도권을 쥔 도미넌트(Dominant). 성경 구절을 은유 삼아 상대의 죄의식과 쾌락을 훈육함.'
  },
  femaleLead: {
    name: '서유진',
    age: '32세 (연상녀)',
    role: '교회 찬양팀 리더 / 성악 강사',
    personality: '사회적으로는 우아하고 헌신적인 완벽주의자. 내면에는 강한 억압과 타인의 엄격한 지배 아래 복종할 때 극도의 안식과 열락을 느끼는 피학적 성향을 지님.',
    appearance: '창백하고 단아한 얼굴선, 가녀린 목덜미와 굴곡진 체형, 감정에 흔들릴 때 붉어지는 눈가.',
    secretDesire: '자신의 도덕적 체면을 짓밟고 엄하게 다스려줄 절대적인 주인(Lord)을 갈망함.'
  },
  supportingCast: '박 목사 (엄격한 담임목사, 태하를 총애함), 한지원 (유진을 흠모하는 청년부 회장, 둘의 기류를 의심함), 권사들 (교회 내 소문과 평판 감시자들).',
  toneStyle: '배덕감 어린 긴장감, 종교적 경건함과 농밀한 관능미의 대조, 섬세한 심리 묘사 및 탐닉적 문체.',
  pov: '1인칭 주인공 시점 (유진 시점) 및 3인칭 전지적 시점 교차',
  tense: '과거형 위주의 긴장감 있는 어조',
  targetAudience: '20-30대 고수위 피폐·배덕 로맨스 독자층 및 서사 지향 성인 웹소설 독자',
  primaryTropes: ['사제지간', '연상녀연하남', '개신교회 연애물', '메조히스트 여성', '조교물']
};

export const INITIAL_EPISODES: EpisodeCard[] = [
  {
    id: 'ep-1',
    stageNumber: 1,
    subNumber: 1,
    title: '제1화: 성가대실의 닫힌 문',
    outline: '비 내리는 수요일 저녁, 텅 빈 예배당 성가대실에서 홀로 연습하던 유진에게 새로 부임한 젊은 전도사 태하가 조용히 다가온다. 악보를 짚어주는 그의 손끝에서 서늘한 긴장이 맴돈다.',
    keyConflict: '사회적 체면과 단정한 가면 뒤에 숨겨진 유진의 억눌린 피학적 충동, 이를 간파하듯 응시하는 태하의 시선.',
    climaxPoint: '태하가 유진의 흐트러진 호흡을 지적하며 턱을 들어 올리는 순간, 유진의 심장이 멎을 듯 요동친다.'
  },
  {
    id: 'ep-2',
    stageNumber: 2,
    subNumber: 1,
    title: '제2화: 고해(告解) 아닌 훈육',
    outline: '태하는 유진에게 특별 성경 공부를 제안하고, 인적이 드문 자모실로 부른다. 유진이 평소 느끼던 공허함과 죄책감을 짚어내며 심리적인 거리를 좁혀온다.',
    keyConflict: '사역자와 성도라는 위계, 연상과 연하라는 나이 차이 사이에서 뒤틀리는 복종의 징후.',
    climaxPoint: '“집사님, 기도는 그렇게 고개를 빳빳이 들고 하는 게 아닙니다.” 유진의 무릎을 바닥에 닿게 누르는 태하의 차가운 목소리.'
  },
  {
    id: 'ep-3',
    stageNumber: 5,
    subNumber: 1,
    title: '제3화: 첫 번째 계명',
    outline: '교회 수련회 답사지인 한적한 기도원. 태하는 문을 걸어 잠그고 유진에게 첫 번째 징벌과 복종의 규칙을 하달한다.',
    keyConflict: '신앙의 규율을 역이용한 지배와, 수치심 속에서 터져 나오는 유진의 은밀한 쾌락.',
    climaxPoint: '손목이 묶인 채 그의 가르침을 입으로 되뇌는 유진의 굴복.'
  }
];

export const INITIAL_PERSONAS: CommenterPersona[] = [
  {
    id: 'p-1',
    name: '새벽기도3년차',
    platform: 'Theqoo',
    age: '20대 후반',
    gender: '여성',
    personality: '과몰입 주접러, 매 회차 심장 부여잡고 달리는 로맨스 매니아',
    commentTone: 'ㅠㅠㅠㅠㅠ 남주 눈빛 미쳤냐고 유진언니 무릎 꿇을 때 내 텐션도 터짐;;',
    avatarSeed: 'amber'
  },
  {
    id: 'p-2',
    name: '성경책던진놈',
    platform: 'ArcaLive',
    age: '20대 초반',
    gender: '남성',
    personality: '자극과 매운맛을 찾는 서브컬처/챈 유저, 밈 적극 사용',
    commentTone: '전도사 무브먼트 폼 미쳤다 ㅋㅋㅋ 사제지간 조교물 goat 인정한다 개추 박고 감',
    avatarSeed: 'cyan'
  },
  {
    id: 'p-3',
    name: '흑화한양떼',
    platform: 'Novelpia',
    age: '20대 중반',
    gender: '남성',
    personality: '수위와 필력 중시, 빌드업 분석형 독자',
    commentTone: '심리 묘사 진짜 쫀득하네. 연하 전도사가 연상녀 멘탈 깎아먹으면서 길들이는 텐션 최상급임. 다음화 분량 2배로 줘요',
    avatarSeed: 'emerald'
  },
  {
    id: 'p-4',
    name: '달콤한배덕',
    platform: 'RidiBooks',
    age: '30대 초반',
    gender: '여성',
    personality: '정통 피폐 로설 애독자, 서평식 감상과 별점 관리',
    commentTone: '★★★★★ 사제지간 클리셰를 이렇게 배덕하고 우아하게 풀다니... 여주의 은밀한 결핍을 정확하게 파고드는 남주의 통제력이 압권입니다.',
    avatarSeed: 'violet'
  }
];
