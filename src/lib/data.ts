export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  description: string;
  category: string;
  status: 'open' | 'closed' | 'full';
};

export type Application = {
  id: string;
  eventId: string;
  userName: string;
  email: string;
  phone: string;
  appliedAt: string;
  attended: boolean;
  canceled: boolean;
};

export const events: Event[] = [
  {
    id: 'evt-001',
    title: '2026 봄학기 오리엔테이션',
    date: '2026-06-01',
    time: '10:00',
    location: '대학 본관 1층 강당',
    capacity: 200,
    registered: 145,
    description: '신입생 및 편입생을 위한 학교 안내 오리엔테이션입니다. 교육 과정, 시설 안내, 동아리 소개 등이 진행됩니다.',
    category: '학교 행사',
    status: 'open',
  },
  {
    id: 'evt-002',
    title: '진로 탐색 워크숍',
    date: '2026-06-10',
    time: '14:00',
    location: '공학관 세미나실 A',
    capacity: 50,
    registered: 50,
    description: '다양한 분야의 직업인을 초청하여 진로 탐색 기회를 제공하는 워크숍입니다.',
    category: '워크숍',
    status: 'full',
  },
  {
    id: 'evt-003',
    title: '학생 창업 아이디어 경진대회',
    date: '2026-06-20',
    time: '09:00',
    location: '창업지원센터',
    capacity: 100,
    registered: 32,
    description: '학생들이 창의적인 창업 아이디어를 발표하고 심사받는 경진대회입니다. 우수팀에게는 창업 지원금이 제공됩니다.',
    category: '대회',
    status: 'open',
  },
  {
    id: 'evt-004',
    title: 'AI·머신러닝 특강',
    date: '2026-07-05',
    time: '13:00',
    location: '전산관 102호',
    capacity: 80,
    registered: 67,
    description: '현직 AI 개발자가 강의하는 실무 중심 특강입니다. 기초 Python부터 모델 배포까지 다룹니다.',
    category: '특강',
    status: 'open',
  },
];

export const applications: Application[] = [
  {
    id: 'app-001',
    eventId: 'evt-001',
    userName: '김민준',
    email: 'minjun@university.ac.kr',
    phone: '010-1234-5678',
    appliedAt: '2026-05-15',
    attended: false,
    canceled: false,
  },
  {
    id: 'app-002',
    eventId: 'evt-003',
    userName: '이서연',
    email: 'seoyeon@university.ac.kr',
    phone: '010-2345-6789',
    appliedAt: '2026-05-16',
    attended: false,
    canceled: false,
  },
  {
    id: 'app-003',
    eventId: 'evt-004',
    userName: '박지호',
    email: 'jiho@university.ac.kr',
    phone: '010-3456-7890',
    appliedAt: '2026-05-17',
    attended: true,
    canceled: false,
  },
  {
    id: 'app-004',
    eventId: 'evt-001',
    userName: '최유진',
    email: 'yujin@university.ac.kr',
    phone: '010-4567-8901',
    appliedAt: '2026-05-14',
    attended: false,
    canceled: true,
  },
];
