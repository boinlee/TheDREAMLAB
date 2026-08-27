# The Dream Lab 홈페이지

더드림랩의 LG B2B 가전 패키지 소개·장바구니 견적·상담 문의를 위한 정적 웹사이트입니다.

- 운영 사이트: <https://thedreamlab.vercel.app>
- GitHub: <https://github.com/boinlee/TheDREAMLAB>
- 배포: Vercel (`main` 브랜치 푸시 시 자동 배포)

## 주요 기능

- 원룸·오피스텔·호텔/모텔 기준 LG 가전 상품 목록 및 모델별 장바구니
- 장바구니 품목·수량·VAT 포함 합계가 포함된 견적 문의
- 30초 간편 견적 및 일반 상담 문의
- Formspree 이메일 수신과 Supabase 문의 이력 저장
- 개인정보처리방침·이용약관·필수 동의, 모바일 메뉴 및 키보드 접근성 지원

## 문의 데이터 흐름

```text
고객 문의폼
  └─ Formspree 전송 성공
       ├─ 담당자 이메일 수신
       └─ Supabase quote_requests에 문의 이력 저장
```

Supabase는 브라우저에서 **문의 등록(INSERT)만** 허용합니다. 조회·수정·삭제는 RLS(Row Level Security)로 차단되어 있으며, 서비스 역할 키는 어떤 경우에도 브라우저 코드에 넣지 않습니다.

## 로컬 실행

Node.js가 설치된 환경에서 다음 명령으로 실행합니다.

```bash
npm run dev
```

실행 후 표시되는 로컬 주소(일반적으로 `http://localhost:3000`)에서 확인합니다.

## 배포

Vercel 프로젝트가 GitHub 저장소와 연결되어 있습니다.

1. `main` 브랜치에 변경 사항을 푸시합니다.
2. Vercel이 자동으로 운영 배포를 수행합니다.
3. 배포 후 `https://thedreamlab.vercel.app`에서 확인합니다.

정적 사이트이므로 별도의 빌드 명령은 필요하지 않습니다. Vercel의 Framework Preset은 `Other`로 두고 Build Command는 비워 둡니다.

## 설정 파일

`site-config.js`에서 문의 수신 및 Supabase 공개 연결 값을 관리합니다.

```js
window.DREAMLAB_FORM_ENDPOINT = 'https://formspree.io/f/...';
window.DREAMLAB_SUPABASE_URL = 'https://<project-ref>.supabase.co';
window.DREAMLAB_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_...';
```

`DREAMLAB_SUPABASE_PUBLISHABLE_KEY`는 등록 전용 RLS 정책과 함께 사용하는 공개 키입니다. `service_role`, `sb_secret` 등 비밀 키는 절대로 저장소·Vercel 정적 파일·브라우저 코드에 추가하면 안 됩니다.

## Supabase

- 프로젝트: `thedreamlab` (Seoul, `ap-northeast-2`)
- 테이블: `public.quote_requests`
- 스키마·RLS 정책: [supabase/quote_requests.sql](supabase/quote_requests.sql)

문의 이력은 Supabase 대시보드의 Table Editor에서 `quote_requests` 테이블을 선택해 확인할 수 있습니다. 테스트 문의는 실제 고객 데이터와 혼동되지 않도록 확인 후 삭제합니다.

## 프로젝트 구조

```text
├── index.html          # 메인 페이지 및 일반 문의
├── shop.html           # 업종별 상품 목록·간편 견적
├── cart.html           # 장바구니·견적 문의·인쇄
├── about.html          # 회사 소개·사업자등록증
├── blog.html           # 콘텐츠
├── privacy.html        # 개인정보처리방침
├── terms.html          # 이용약관
├── script.js           # 상품·장바구니·문의 전송 로직
├── styles.css          # 공통 스타일
├── site-config.js      # Formspree·Supabase 공개 설정
├── images/             # 이미지 자산
└── supabase/
    └── quote_requests.sql
```

## 운영 점검

- 문의 테스트 시 Formspree에는 제목에 `[TEST]`를 붙입니다.
- Supabase 테스트 행은 확인 직후 삭제합니다.
- 상품 모델·가격·설치 조건 변경 시 `script.js`의 `PRODUCTS_DATA`와 화면 문구를 함께 검토합니다.
- 개인정보를 다루는 정책 또는 DB 권한을 변경할 때는 RLS가 유지되는지 반드시 확인합니다.
