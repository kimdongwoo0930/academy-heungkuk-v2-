# 🏨 흥국생명 연수원 관리 시스템 v2.0

> 전화로 접수된 예약을 입력·관리하는 **연수원 내부 관리 시스템**

---

## 📋 프로젝트 개요

| 항목       | 내용                        |
| ---------- | --------------------------- |
| 프로젝트명 | 흥국생명 연수원 관리 시스템 |
| 버전       | 0.2.0                       |
| 사용 대상  | 연수원 직원                 |

---

## 🛠️ 기술 스택

### 백엔드

| 항목      | 기술               |
| --------- | ------------------ |
| Framework | Spring Boot 3.5.11 |
| Language  | Java 21            |
| ORM       | JPA / Hibernate    |
| DB        | MySQL              |
| 인증      | JWT                |
| 빌드      | Gradle             |

### 프론트엔드

| 항목      | 기술                    |
| --------- | ----------------------- |
| Framework | Next.js 15 (App Router) |
| Language  | TypeScript              |
| 스타일    | CSS Module              |
| 상태관리  | Zustand                 |
| HTTP      | Axios                   |

### 인프라

| 항목     | 기술                        |
| -------- | --------------------------- |
| 서버     | Oracle Cloud ARM (12GB RAM) |
| 컨테이너 | Docker / docker-compose     |
| 개발환경 | Code Server                 |

---

## 👥 사용자 역할 (Role)

| 역할         | 설명      | 권한                        |
| ------------ | --------- | --------------------------- |
| `ROLE_ADMIN` | 관리자    | 모든 기능 + 계정 관리       |
| `ROLE_USER`  | 일반 직원 | 예약 조회·수정 (계정 관리 불가) |

---

## 🗄️ ERD

```
account
├── id              BIGINT PK
├── user_id         VARCHAR(50) UNIQUE NOT NULL
├── username        VARCHAR(50) NOT NULL
├── password        VARCHAR(255) NOT NULL          -- BCrypt
├── role            VARCHAR(20) NOT NULL            -- ROLE_ADMIN / ROLE_USER
├── state           BOOLEAN NOT NULL               -- 계정 활성화 여부
├── refresh_token   VARCHAR(500)
├── created_at      DATETIME
└── updated_at      DATETIME

reservation
├── id                  BIGINT PK
├── reservation_code    VARCHAR(20) UNIQUE NOT NULL  -- 예: RES-20260401-001
├── organization        VARCHAR(100) NOT NULL        -- 단체명
├── purpose             VARCHAR(255) NOT NULL        -- 연수 목적
├── 인원수              INT                          -- 총 인원
├── customer            VARCHAR(50) NOT NULL         -- 담당자명
├── customer_phone      VARCHAR(20) NOT NULL         -- 담당자 연락처
├── customer_phone2     VARCHAR(20)                  -- 담당자 연락처2 (선택)
├── customer_email      VARCHAR(100) NOT NULL        -- 담당자 이메일
├── start_date          DATE NOT NULL
├── end_date            DATE NOT NULL
├── color_code          VARCHAR(10) NOT NULL         -- 캘린더 표시 색상
├── status              VARCHAR(20) NOT NULL         -- 확정 / 대기 / 취소
├── company_address     VARCHAR(255)                 -- 업체 주소 (선택)
├── site_manager        VARCHAR(50)                  -- 현장 담당자 (선택)
├── site_manager_phone  VARCHAR(20)                  -- 현장 담당자 연락처 (선택)
├── memo                TEXT                         -- 특이사항 (선택)
├── created_at          DATETIME
└── updated_at          DATETIME

classroom_reservation  (1 예약 : N 강의실 행)
├── id              BIGINT PK
├── reservation_id  BIGINT FK → reservation.id
├── classroom       VARCHAR(10) NOT NULL             -- 강의실 호수
├── reserved_date   DATE NOT NULL                    -- 사용 날짜
├── created_at      DATETIME
└── updated_at      DATETIME

room_reservation  (1 예약 : N 객실 행)
├── id              BIGINT PK
├── reservation_id  BIGINT FK → reservation.id
├── room_number     VARCHAR(10) NOT NULL             -- 객실 호수
├── reserved_date   DATE NOT NULL                    -- 숙박 날짜
├── created_at      DATETIME
└── updated_at      DATETIME

meal_reservation  (1 예약 : N 식사 행)
├── id                  BIGINT PK
├── reservation_id      BIGINT FK → reservation.id
├── meal_date           DATE NOT NULL
├── breakfast           INT                          -- 조식 인원
├── lunch               INT                          -- 중식 인원
├── dinner              INT                          -- 석식 인원
├── special_breakfast   BOOLEAN NOT NULL DEFAULT false
├── special_lunch       BOOLEAN NOT NULL DEFAULT false
├── special_dinner      BOOLEAN NOT NULL DEFAULT false
├── created_at          DATETIME
└── updated_at          DATETIME

survey_token
├── id              BIGINT PK
├── reservation_id  VARCHAR NOT NULL                 -- 연결 예약 ID
├── token           VARCHAR(255) UNIQUE NOT NULL
├── is_used         BOOLEAN NOT NULL
├── created_at      DATETIME
└── updated_at      DATETIME

survey  (1 토큰 : N 설문 응답)
├── id          BIGINT PK
├── token_id    BIGINT FK → survey_token.id
├── answer      TEXT NOT NULL                        -- JSON 형태 응답
├── created_at  DATETIME
└── updated_at  DATETIME

app_setting
├── id              BIGINT PK
├── setting_key     VARCHAR(100) UNIQUE NOT NULL
├── setting_value   VARCHAR(500) NOT NULL
├── created_at      DATETIME
└── updated_at      DATETIME
```

---

## 🌐 API 명세

> 기본 URL: `https://api.hka.kr/v1`
> 모든 응답 형식: `{ "success": true, "message": "...", "data": { ... } }`

### 인증 (공개)

| Method | Endpoint            | 설명                          |
| ------ | ------------------- | ----------------------------- |
| POST   | `/auth/login`       | 로그인 (JWT 발급)             |
| POST   | `/auth/reissue`     | Access Token 재발급           |

### 계정 관리 `🔐 JWT 필요`

| Method | Endpoint                          | 설명                   |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/admin/accounts`                 | 계정 생성              |
| GET    | `/admin/accounts`                 | 전체 계정 조회         |
| PATCH  | `/admin/accounts/{id}/role`       | 역할 변경              |
| PATCH  | `/admin/accounts/{id}/password`   | 관리자 비밀번호 변경   |
| PATCH  | `/admin/accounts/me/password`     | 내 비밀번호 변경       |
| DELETE | `/admin/accounts/{id}`            | 계정 삭제              |

### 예약 관리 `🔐 JWT 필요`

| Method | Endpoint                                    | 설명                                       |
| ------ | ------------------------------------------- | ------------------------------------------ |
| POST   | `/admin/reservations`                       | 예약 등록 (강의실·객실·식사 포함)          |
| GET    | `/admin/reservations`                       | 전체 예약 목록 조회                        |
| GET    | `/admin/reservations/{id}`                  | 예약 상세 조회                             |
| PUT    | `/admin/reservations/{id}`                  | 예약 전체 수정 (하위 데이터 재생성)        |
| DELETE | `/admin/reservations/{id}`                  | 예약 취소 (상태를 "취소"로 변경, Soft)     |
| GET    | `/admin/reservations/check-classroom`       | 강의실 이용 가능 여부 확인 (`?classroom=&date=`) |

### 설문 (공개 / 관리자 혼합)

| Method | Endpoint                                    | Auth | 설명                         |
| ------ | ------------------------------------------- | ---- | ---------------------------- |
| POST   | `/admin/surveys/token/{reservationId}`      | 🔐   | 설문 토큰(URL) 생성          |
| GET    | `/admin/surveys/token/{reservationId}`      | 🔐   | 예약별 설문 토큰 조회        |
| GET    | `/admin/surveys/tokens`                     | 🔐   | 전체 토큰 목록 조회          |
| GET    | `/admin/surveys/{reservationId}`            | 🔐   | 예약별 설문 응답 조회        |
| GET    | `/admin/surveys`                            | 🔐   | 전체 설문 응답 조회          |
| GET    | `/survey/check/{token}`                     | 공개 | 토큰 유효성 확인             |
| POST   | `/survey/{token}`                           | 공개 | 설문 응답 제출               |

### 앱 설정 `🔐 JWT 필요`

| Method | Endpoint            | 설명                    |
| ------ | ------------------- | ----------------------- |
| GET    | `/admin/settings`   | 설정 전체 조회 (KV Map) |
| PUT    | `/admin/settings`   | 설정 전체 저장          |

---

## 📌 기능 명세

### 1. 인증 / 계정 관리

| 기능           | 설명                              | 상태     |
| -------------- | --------------------------------- | -------- |
| 로그인         | ID/PW 입력 후 JWT 발급            | ✅ 완료  |
| 로그아웃       | 클라이언트 토큰 제거              | ✅ 완료  |
| 계정 생성      | 관리자가 직원 계정 생성           | ✅ 완료  |
| 역할 변경      | ADMIN ↔ USER 전환                 | ✅ 완료  |
| 비밀번호 변경  | 관리자 또는 본인                  | ✅ 완료  |
| 계정 삭제      | 관리자만 가능                     | ✅ 완료  |

### 2. 예약 관리

| 기능                | 설명                                                   | 상태     |
| ------------------- | ------------------------------------------------------ | -------- |
| 예약 등록           | 기본정보 + 강의실·객실·식사 한 번에 등록               | ✅ 완료  |
| 예약 조회           | 목록 / 상세 조회                                       | ✅ 완료  |
| 예약 수정           | 전체 수정 (하위 데이터 재생성)                         | ✅ 완료  |
| 예약 취소           | 상태를 "취소"로 변경 (Soft Delete)                     | ✅ 완료  |
| 특식 구분           | 조식·중식·석식별 특식 여부 토글                        | ✅ 완료  |
| 업체 주소·현장담당자 | 선택 입력 필드                                         | ✅ 완료  |
| 예약 색상           | 20가지 색상 중 선택 (캘린더 표시용)                    | ✅ 완료  |
| 강의실 중복 확인    | 날짜·강의실 중복 여부 실시간 체크                      | ✅ 완료  |

### 3. 일정 현황 (Scheduler)

| 기능               | 설명                                        | 상태     |
| ------------------ | ------------------------------------------- | -------- |
| 월별 현황표        | 강의실·숙소를 행, 날짜를 열로 표시          | ✅ 완료  |
| 식수 현황표        | 날짜별 조식·중식·석식 인원 표시             | ✅ 완료  |
| 호버 팝업          | 예약 간단 정보 미니 팝업                    | ✅ 완료  |
| 셀 클릭            | 예약 상세 모달                              | ✅ 완료  |
| 셀 더블클릭        | 날짜·강의실 자동 세팅 후 신규 예약 모달     | ✅ 완료  |
| 특식 시각화        | 주황색 pill 표시                            | ✅ 완료  |
| 확정/대기 시각화   | 확정 = 빨간 볼드, 대기 = 회색              | ✅ 완료  |

### 4. 식수 현황 (Restaurant)

| 기능             | 설명                              | 상태     |
| ---------------- | --------------------------------- | -------- |
| 날짜별 식수 현황 | 예약 상태·특식 여부로 색상 구분   | ✅ 완료  |

### 5. 문서 출력

| 기능        | 설명                          | 상태          |
| ----------- | ----------------------------- | ------------- |
| 견적서 DOCX | 예약 기반 견적서 Word 생성    | ✅ 완료       |
| 확인서      | 예약 확인서 출력              | ⏳ 추후 작업  |

> ⚠️ PDF 양식 — 양식 수령 후 작업 예정

### 6. 설문 시스템

| 기능           | 설명                                          | 상태     |
| -------------- | --------------------------------------------- | -------- |
| 설문 URL 생성  | 예약 기반 고유 토큰 생성                      | ✅ 완료  |
| 설문 응답      | 고객이 링크 접속 후 응답 (로그인 불필요)      | ✅ 완료  |
| 설문 결과 조회 | 직원이 응답 결과 확인                         | ✅ 완료  |

### 7. 대시보드

| 기능        | 설명                              | 상태         |
| ----------- | --------------------------------- | ------------ |
| 통계 차트   | 월별·분기별 예약 건수, 인원 통계  | 🔲 미구현    |

---

## 🗓️ 개발 단계

```
✅ 1단계  백엔드 기반    — 공통 구조, DB 설계, 인증 API
✅ 2단계  프론트 기반   — 프로젝트 세팅, 레이아웃, 공통 컴포넌트
✅ 3단계  예약 기능     — 예약 등록 / 조회 / 수정 / 삭제
✅ 4단계  캘린더        — 월별 현황, 식수 현황
✅ 5단계  설문 시스템   — URL 생성, 응답, 결과 조회
🔲 6단계  대시보드      — 통계 차트, 현황판
🔲 7단계  반응형        — 모바일 최적화
🔲 8단계  PDF 문서      — 견적서/확인서 (양식 수령 후)
🔲 9단계  Docker 배포   — docker-compose 구성
```

---

_최종 수정: 2026-03-22_
