export const COLOR_PRIMARY = '#1a73e8';
export const COLOR_SECONDARY = '#ffffff';
export const COLOR_ACCENT = '#ff6d00';
export const COLOR_BG_START = '#0f172a';
export const COLOR_BG_END = '#1e293b';

export interface NewsItem {
    id: string;
    title: string;
    body: string;
    subtitle: string;
    duration: number; // in seconds
    startTime: number; // in seconds
}

export const NEWS_DATA: NewsItem[] = [
    {
        id: 'intro',
        title: 'POLITICAL ROUNDUP',
        body: '2026년 2월 19일\n오늘의 주요 정치 뉴스입니다.',
        subtitle: '변화하는 대한민국 정무의 현재를 전해드립니다.',
        duration: 5,
        startTime: 0,
    },
    {
        id: 'news1',
        title: 'BREAKING NEWS',
        body: '윤석열 전 대통령 1심 선고\n"내란 수괴" 혐의 무기징역',
        subtitle: '비상계엄 선포 이후 443일 만의 법적 판단입니다.\n헌재의 파면 결정에 이은 역사적인 판결로 기록될 전망입니다.',
        duration: 15,
        startTime: 5,
    },
    {
        id: 'news2',
        title: 'APPROVAL RATING',
        body: '이재명 대통령 지지율 63%\n민생 행보 및 부동산 정책 호평',
        subtitle: '부동산 시장 안정화에 대한 국민적 기대감이 지지율 상승을 견인했습니다.\n취약계층을 위한 민생 대책 역량 집중이 긍정적 평가를 받았습니다.',
        duration: 20,
        startTime: 20,
    },
    {
        id: 'news3',
        title: 'ECONOMY 2026',
        body: '한국경제 대도약 원년 선포\n성장전략 및 민생 대책 발표',
        subtitle: 'SMR 특별법 통과와 대규모 민생 자금 공급이 예정되었습니다.\n2026년을 경제 선도국 도약의 해로 삼겠다는 국정 의지가 반영되었습니다.',
        duration: 15,
        startTime: 40,
    },
    {
        id: 'outro',
        title: 'LATEST NEWS',
        body: '국민의 목소리에 귀 기울이는\n대한민국 정치를 응원합니다.',
        subtitle: '더 투명하고 정의로운 내일을 응원합니다.\n시청해 주셔서 감사합니다.',
        duration: 5,
        startTime: 55,
    },
];
