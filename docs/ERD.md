# 🗄️ DB 설계 (ERD)

> 모든 테이블은 `created_at`, `updated_at` 컬럼을 포함합니다 (BaseTimeEntity 상속).



---

## 📋 테이블 목록

| 테이블명              | 설명            |
| --------------------- | --------------- |
| account               | 직원 계정       |
| reservation           | 예약 마스터     |
| classroom_reservation | 강의실 예약     |
| room_reservation      | 객실 예약       |
| meal_reservation      | 식사(식수) 예약 |
| survey_token          | 설문 토큰       |
| survey                | 설문 응답       |
| app_setting           | 앱 설정 (KV)    |

---

## 테이블 상세

### account (직원 계정)

| 컬럼명        | 타입         | 필수 | 설명                   |
| ------------- | ------------ | ---- | ---------------------- |
| id            | BIGINT       | ✅   | PK, AUTO_INCREMENT     |
| user_id       | VARCHAR(50)  | ✅   | 로그인 아이디 (UNIQUE) |
| username      | VARCHAR(50)  | ✅   | 직원 이름              |
| password      | VARCHAR(255) | ✅   | BCrypt 암호화 비밀번호 |
| role          | VARCHAR(20)  | ✅   | ROLE_ADMIN / ROLE_USER |
| state         | BOOLEAN      | ✅   | 계정 활성화 여부       |
| refresh_token | VARCHAR(500) | ❌   | JWT Refresh Token      |
| created_at    | DATETIME     | ✅   | 생성일시               |
| updated_at    | DATETIME     | ✅   | 수정일시               |

---

### reservation (예약 마스터)

| 컬럼명             | 타입         | 필수 | 설명                                         |
| ------------------ | ------------ | ---- | -------------------------------------------- |
| id                 | BIGINT       | ✅   | PK, AUTO_INCREMENT                           |
| reservation_code   | VARCHAR(20)  | ✅   | 고유 예약 번호 (UNIQUE) ex) RES-20260401-001 |
| organization       | VARCHAR(100) | ✅   | 단체명                                       |
| purpose            | VARCHAR(255) | ✅   | 연수 목적                                    |
| 인원수             | INT          | ❌   | 총 인원                                      |
| customer           | VARCHAR(50)  | ✅   | 담당자 이름                                  |
| customer_phone     | VARCHAR(20)  | ✅   | 담당자 연락처                                |
| customer_phone2    | VARCHAR(20)  | ❌   | 담당자 연락처2                               |
| customer_email     | VARCHAR(100) | ✅   | 담당자 이메일                                |
| start_date         | DATE         | ✅   | 시작일                                       |
| end_date           | DATE         | ✅   | 종료일                                       |
| color_code         | VARCHAR(10)  | ✅   | 캘린더 표시 색상 (#FF5733)                   |
| status             | VARCHAR(20)  | ✅   | 확정 / 대기 / 취소                           |
| company_address    | VARCHAR(255) | ❌   | 업체 주소                                    |
| site_manager       | VARCHAR(50)  | ❌   | 현장 담당자                                  |
| site_manager_phone | VARCHAR(20)  | ❌   | 현장 담당자 연락처                           |
| memo               | TEXT         | ❌   | 특이사항                                     |
| created_at         | DATETIME     | ✅   | 생성일시                                     |
| updated_at         | DATETIME     | ✅   | 수정일시                                     |

---

### classroom_reservation (강의실 예약)

> 예약 1건에 강의실 여러 개 / 날짜별 행 분리 저장

| 컬럼명         | 타입        | 필수 | 설명                |
| -------------- | ----------- | ---- | ------------------- |
| id             | BIGINT      | ✅   | PK, AUTO_INCREMENT  |
| reservation_id | BIGINT      | ✅   | FK → reservation.id |
| classroom      | VARCHAR(10) | ✅   | 강의실 호실         |
| reserved_date  | DATE        | ✅   | 사용 날짜           |
| created_at     | DATETIME    | ✅   | 생성일시            |
| updated_at     | DATETIME    | ✅   | 수정일시            |

#### 강의실 목록

| 구분     | 호실 | 수용인원 |
| -------- | ---- | -------- |
| 대강의실 | 105  | 120인    |
| 중강의실 | 201  | 70인     |
| 중강의실 | 203  | 50인     |
| 중강의실 | 204  | 50인     |
| 소강의실 | 202  | 30인     |
| 소강의실 | 103  | 30인     |
| 소강의실 | 102  | 20인     |
| 분임실   | 106  | 12인     |
| 분임실   | 205  | 12인     |
| 분임실   | 206  | 12인     |
| 다목적실 | A    | 80인     |
| 다목적실 | B    | 40인     |

---

### room_reservation (객실 예약)

> 예약 1건에 객실 여러 개 / 날짜별 행 분리 저장

| 컬럼명         | 타입        | 필수 | 설명                |
| -------------- | ----------- | ---- | ------------------- |
| id             | BIGINT      | ✅   | PK, AUTO_INCREMENT  |
| reservation_id | BIGINT      | ✅   | FK → reservation.id |
| room_number    | VARCHAR(10) | ✅   | 객실 호수           |
| reserved_date  | DATE        | ✅   | 숙박 날짜           |
| created_at     | DATETIME    | ✅   | 생성일시            |
| updated_at     | DATETIME    | ✅   | 수정일시            |

#### 객실 목록 (현재 1층만 사용)

| 타입  | 호수             |
| ----- | ---------------- |
| 1인실 | 109, 126         |
| 2인실 | 110, 111, 127    |
| 4인실 | 나머지 (101~127) |

> ⚠️ 2층 사용 시 목록 추가 예정

---

### meal_reservation (식사 예약)

> 날짜별 조/중/석 인원 및 특식 여부 관리

| 컬럼명            | 타입     | 필수 | 설명                            |
| ----------------- | -------- | ---- | ------------------------------- |
| id                | BIGINT   | ✅   | PK, AUTO_INCREMENT              |
| reservation_id    | BIGINT   | ✅   | FK → reservation.id             |
| meal_date         | DATE     | ✅   | 식사 날짜                       |
| breakfast         | INT      | ❌   | 조식 인원                       |
| lunch             | INT      | ❌   | 중식 인원                       |
| dinner            | INT      | ❌   | 석식 인원                       |
| special_breakfast | BOOLEAN  | ✅   | 조식 특식 여부 (default: false) |
| special_lunch     | BOOLEAN  | ✅   | 중식 특식 여부 (default: false) |
| special_dinner    | BOOLEAN  | ✅   | 석식 특식 여부 (default: false) |
| created_at        | DATETIME | ✅   | 생성일시                        |
| updated_at        | DATETIME | ✅   | 수정일시                        |

---

### survey_token (설문 토큰)

| 컬럼명         | 타입         | 필수 | 설명                    |
| -------------- | ------------ | ---- | ----------------------- |
| id             | BIGINT       | ✅   | PK, AUTO_INCREMENT      |
| reservation_id | VARCHAR      | ✅   | 연결 예약 ID            |
| token          | VARCHAR(255) | ✅   | 고유 설문 토큰 (UNIQUE) |
| is_used        | BOOLEAN      | ✅   | 응답 여부               |
| created_at     | DATETIME     | ✅   | 생성일시                |
| updated_at     | DATETIME     | ✅   | 수정일시                |

---

### survey (설문 응답)

| 컬럼명     | 타입     | 필수 | 설명                    |
| ---------- | -------- | ---- | ----------------------- |
| id         | BIGINT   | ✅   | PK, AUTO_INCREMENT      |
| token_id   | BIGINT   | ✅   | FK → survey_token.id    |
| answer     | TEXT     | ✅   | 응답 내용 (JSON 문자열) |
| created_at | DATETIME | ✅   | 응답일시                |
| updated_at | DATETIME | ✅   | 수정일시                |

---

### app_setting (앱 설정)

| 컬럼명        | 타입         | 필수 | 설명               |
| ------------- | ------------ | ---- | ------------------ |
| id            | BIGINT       | ✅   | PK, AUTO_INCREMENT |
| setting_key   | VARCHAR(100) | ✅   | 설정 키 (UNIQUE)   |
| setting_value | VARCHAR(500) | ✅   | 설정 값            |
| created_at    | DATETIME     | ✅   | 생성일시           |
| updated_at    | DATETIME     | ✅   | 수정일시           |
