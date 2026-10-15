export const INITIAL_FIELDS = [
  {
    id: 'summary',
    name: '요약 (Summary)',
    type: 'text',
    isMandatory: true,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true, // 관리자가 필수 해제도 원하면 할 수 있도록 허용
    placeholder: '이슈의 핵심 내용을 간단히 요약해주세요',
    description: '티켓의 대표 제목입니다.'
  },
  {
    id: 'issueType',
    name: '이슈 유형 (Issue Type)',
    type: 'select',
    options: ['Bug', 'Task', 'Story', 'Improvement', 'Epic'],
    isMandatory: true,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true,
    placeholder: '이슈 유형 선택',
    description: '이슈의 성격을 분류합니다.'
  },
  {
    id: 'priority',
    name: '우선순위 (Priority)',
    type: 'select',
    options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
    isMandatory: true,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true,
    placeholder: '우선순위 선택',
    description: '해결 시급도를 지정합니다.'
  },
  {
    id: 'assignee',
    name: '담당자 (Assignee)',
    type: 'select',
    options: ['김개발 (Frontend)', '이백엔 (Backend)', '박기획 (PM)', '최디자 (UI/UX)', '정품질 (QA)', '미지정'],
    isMandatory: false,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true,
    placeholder: '담당자 배정',
    description: '이슈를 처리할 담당자입니다.'
  },
  {
    id: 'description',
    name: '상세 설명 (Description)',
    type: 'textarea',
    isMandatory: true,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true,
    placeholder: '상세한 이슈 내용 및 배경을 입력해주세요',
    description: '티켓에 대한 상세한 설명입니다.'
  },
  {
    id: 'dueDate',
    name: '마감 기한 (Due Date)',
    type: 'date',
    isMandatory: false,
    isEnabled: true,
    isSystem: true,
    canToggleMandatory: true,
    placeholder: '연도-월-일',
    description: '처리가 완료되어야 하는 목표 일정입니다.'
  },
  {
    id: 'custom_reproduce',
    name: '재현 단계 (Steps to Reproduce)',
    type: 'textarea',
    isMandatory: true,
    isEnabled: true,
    isSystem: false,
    canToggleMandatory: true,
    placeholder: '1. 설정 화면 진입\n2. 저장 버튼 클릭 시 500 에러 발생',
    description: '버그나 이슈를 재현할 수 있는 구체적인 절차를 기입하세요.'
  },
  {
    id: 'custom_service',
    name: '영향 받는 서비스 (Impacted Service)',
    type: 'select',
    options: ['결제 시스템 (Billing)', '인증/로그인 (Auth)', '사용자 대시보드 (App)', '푸시 알림 (Notification)', '기타'],
    isMandatory: false,
    isEnabled: true,
    isSystem: false,
    canToggleMandatory: true,
    placeholder: '서비스 선택',
    description: '이슈의 영향을 받는 도메인이나 시스템을 선택합니다.'
  }
];

export const INITIAL_ISSUES = [
  {
    id: 'FLOW-101',
    summary: '소셜 로그인 후 간헐적 세션 만료 현상 발생',
    issueType: 'Bug',
    priority: 'High',
    status: 'inprogress',
    assignee: '이백엔 (Backend)',
    description: '구글 계정으로 로그인 후 5분이 경과하면 리프레시 토큰 갱신 실패로 로그아웃되는 이슈입니다.',
    dueDate: '2026-10-20',
    createdAt: '2026-10-14T10:00:00Z',
    custom_reproduce: '1. 크롬 브라우저에서 구글 로그인\n2. 5분 대기 후 대시보드 탭 이동\n3. 401 Unauthorized 발생',
    custom_service: '인증/로그인 (Auth)'
  },
  {
    id: 'FLOW-102',
    summary: '결제 모듈 신규 PG사 연동 기능 개발',
    issueType: 'Story',
    priority: 'Highest',
    status: 'todo',
    assignee: '김개발 (Frontend)',
    description: '해외 결제를 위한 신규 결제 게이트웨이 연동 API 및 결제 폼 UI를 추가합니다.',
    dueDate: '2026-10-30',
    createdAt: '2026-10-14T11:30:00Z',
    custom_reproduce: '해당 없음 (신규 기능 기획서 참조)',
    custom_service: '결제 시스템 (Billing)'
  },
  {
    id: 'FLOW-103',
    summary: '모바일 환경에서 사이드바 메뉴 터치 제스처 개선',
    issueType: 'Improvement',
    priority: 'Medium',
    status: 'done',
    assignee: '최디자 (UI/UX)',
    description: '모바일 뷰포트에서 스와이프로 사이드바를 닫을 수 있도록 제스처 인터랙션을 추가했습니다.',
    dueDate: '2026-10-12',
    createdAt: '2026-10-12T09:15:00Z',
    custom_reproduce: '모바일 디바이스에서 왼쪽 스와이프 제스처 테스트 완료',
    custom_service: '사용자 대시보드 (App)'
  }
];

export const ISSUE_STATUSES = [
  { id: 'todo', label: 'To Do', color: '#42526E', bg: '#DFE1E6', badgeColor: '#42526E' },
  { id: 'inprogress', label: 'In Progress', color: '#0052CC', bg: '#DEEBFF', badgeColor: '#0747A6' },
  { id: 'done', label: 'Done', color: '#00875A', bg: '#E3FCEF', badgeColor: '#006644' }
];
