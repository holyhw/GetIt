# GET IT — 멀티모달 AI 기반 분실물·습득물 매칭 서비스

> 물건을 잃어버렸다면, **Let's Get it**  
> AI가 이미지와 텍스트를 함께 분석해 유사도 높은 습득물 후보를 자동으로 찾아드립니다.

🌐 **배포 사이트**: https://www.getitsju.com/

---

## 프로젝트 소개

유실물은 매년 증가하고 있지만, 기존 서비스는 사용자가 직접 키워드를 입력해 수많은 결과를 일일이 확인해야 하는 **수동 탐색 구조**에 머물러 있습니다.

**GET IT**은 분실물과 습득물을 등록하면 AI가 자동으로 유사 후보 Top 5를 추천하고 매칭 이유까지 함께 제공합니다. 분실자와 습득자는 채팅으로 바로 연결되어 물건 반환 절차를 직접 조율할 수 있습니다.

모바일 앱(Android/iOS)과 웹 모두 지원하며, 동일한 기능을 어떤 환경에서도 사용할 수 있습니다.

---

## 주요 기능

| 기능              | 설명                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| **AI 매칭 Top 5** | 분실물 등록 시 유사 습득물을 유사도 순으로 자동 추천, 추천 이유 제공 |
| **멀티모달 분석** | 이미지와 텍스트를 동시에 분석해 더 정확한 매칭 결과 도출             |
| **자연어 검색**   | "스네이크 지갑"처럼 기억나는 특징만으로 검색 가능                    |
| **실시간 채팅**   | 분실자·습득자 간 1:1 채팅으로 반환 일정 직접 조율                    |
| **매칭 알림**     | 내 습득물이 매칭 후보로 선정되면 즉시 푸시 알림 발송                 |
| **소셜 로그인**   | 카카오·네이버·구글 OAuth2 간편 로그인                                |
| **지도 연동**     | 네이버 지도 기반 습득 위치 등록 및 확인                              |

---

## 기술 스택

**Mobile**

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![FCM](https://img.shields.io/badge/FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Web**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## 화면 구성

**Mobile (React Native / Expo)**

```
├── 스플래시 화면
├── 로그인 — 카카오 / 네이버 / 구글 소셜 로그인
└── 메인 탭바
    ├── 홈 — 습득물·분실물 피드, 카테고리·날짜 필터, 무한 스크롤
    ├── 검색 — 자연어 키워드 + 카테고리 필터 통합 검색
    ├── 등록 — 사진 업로드, 카테고리·위치·시간 입력, 가중치 조정
    ├── 채팅 — 전체·분실·습득 필터 채팅 목록
    └── 프로필 — 마이페이지, 등록 아이템 관리
         ├── 상세 페이지 — 아이템 정보 + AI 매칭 섹션
         ├── AI 매칭 Top 5 — 유사도 % 시각화, 매칭 이유, 바로 채팅 연결
         ├── 채팅방 — 1:1 실시간 채팅
         └── 알림 — 매칭·채팅 알림 목록
```

**Web (Next.js)**

```
├── 로그인 — 카카오 / 네이버 / 구글 소셜 로그인
└── 메인 탭바
    ├── 홈 — 습득물·분실물 피드, 카테고리·날짜 필터, 무한 스크롤
    ├── 검색 — 자연어 키워드 + 카테고리 필터 통합 검색
    ├── 등록 — 사진 업로드, 네이버 지도 위치 선택
    ├── 채팅 — 전체·분실·습득 필터 채팅 목록
    └── 마이페이지 — 등록 아이템 관리, 내 정보 수정
         ├── 상세 페이지 — 아이템 정보 + AI 매칭 섹션
         ├── AI 매칭 Top 5 — 유사도 % 시각화, 매칭 이유, 바로 채팅 연결
         ├── 채팅방 — 1:1 실시간 채팅
         └── 알림 — 매칭·채팅 알림 목록
```

---

## 시작하기

### Mobile

```bash
cd GetIt/mobile

npm install

npm start           # Expo 개발 서버
npm run android     # Android
npm run ios         # iOS
```

### Web

```bash
cd GetIt/web

npm install

npm run dev
```

---

## 프로젝트 구조

```
GetIt/
├── mobile/               # React Native 앱 (Expo)
│   ├── app/              # 화면 (Expo Router 파일 기반 라우팅)
│   │   ├── (tabs)/       # 탭바 — 홈·검색·등록·채팅·프로필
│   │   ├── top5.tsx      # AI 매칭 Top 5
│   │   ├── chatroom.tsx  # 실시간 채팅방
│   │   └── detail.tsx    # 아이템 상세
│   ├── components/       # 공통 컴포넌트
│   ├── context/          # AuthContext 전역 상태
│   ├── utils/            # API 클라이언트, 필터 유틸
│   └── assets/           # 이미지, SVG 아이콘
└── web/                  # Next.js 웹 앱
    ├── app/              # 페이지 (Next.js App Router)
    │   ├── (tabs)/       # 탭바 — 홈·검색·등록·채팅·마이페이지
    │   ├── top5/         # AI 매칭 Top 5
    │   ├── chatroom/     # 실시간 채팅방
    │   └── detail/       # 아이템 상세
    └── components/       # 공통 컴포넌트
```

---

## 시연 영상

[유튜브 링크](https://www.youtube.com/watch?v=dQ4ZTKb0QLs)
