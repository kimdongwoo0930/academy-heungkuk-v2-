# 📡 API 명세서

> Base URL: `https://api.hka.kr/v1`
> 인증이 필요한 API는 Header에 `Authorization: Bearer {accessToken}` 필요

**공통 응답 형식**

```json
{
  "success": true,
  "message": "성공",
  "data": { ... }
}
```

---

## 📋 목차

1. [인증 (Auth)](#1-인증-auth)
2. [계정 (Account)](#2-계정-account)
3. [예약 (Reservation)](#3-예약-reservation)
4. [설문 (Survey)](#4-설문-survey)
5. [앱 설정 (Settings)](#5-앱-설정-settings)
6. [공통 에러 응답](#공통-에러-응답)

---

## 1. 인증 (Auth)

> 인증 불필요

### 1-1. 로그인

```
POST /v1/auth/login
```

**Request**

```json
{
  "userId": "admin",
  "password": "password123"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 1-2. Access Token 재발급

```
POST /v1/auth/reissue
```

**Request**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## 2. 계정 (Account)

> 🔐 JWT 필요

### 2-1. 계정 생성

```
POST /v1/admin/accounts
```

**Request**

```json
{
  "userId": "staff01",
  "username": "김직원",
  "password": "password123",
  "role": "ROLE_USER"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 2,
    "userId": "staff01",
    "username": "김직원",
    "role": "ROLE_USER",
    "state": true
  }
}
```

### 2-2. 계정 목록 조회

```
GET /v1/admin/accounts
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "userId": "admin",
      "username": "홍길동",
      "role": "ROLE_ADMIN",
      "state": true
    }
  ]
}
```

### 2-3. 역할 변경

```
PATCH /v1/admin/accounts/{id}/role
```

**Request**

```json
{
  "role": "ROLE_ADMIN"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

### 2-4. 관리자 비밀번호 변경 (특정 계정)

```
PATCH /v1/admin/accounts/{id}/password
```

**Request**

```json
{
  "newPassword": "newpass123"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

### 2-5. 내 비밀번호 변경

```
PATCH /v1/admin/accounts/me/password
```

**Request**

```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

### 2-6. 계정 삭제

```
DELETE /v1/admin/accounts/{id}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

---

## 3. 예약 (Reservation)

> 🔐 JWT 필요

### 3-1. 전체 예약 목록 조회

```
GET /v1/admin/reservations
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "reservationCode": "RES-20260401-001",
      "organization": "삼성생명 연수팀",
      "purpose": "신입사원 교육",
      "people": 30,
      "customer": "홍길동",
      "customerPhone": "010-1234-5678",
      "customerPhone2": null,
      "customerEmail": "hong@samsung.com",
      "startDate": "2026-04-01",
      "endDate": "2026-04-03",
      "colorCode": "#3b82f6",
      "status": "확정",
      "companyAddress": "서울시 강남구 테헤란로 123",
      "siteManager": "김현장",
      "siteManagerPhone": "010-9999-8888",
      "memo": "채식 메뉴 요청",
      "rooms": [ ... ],
      "classrooms": [ ... ],
      "meals": [ ... ]
    }
  ]
}
```

### 3-2. 예약 단건 조회

```
GET /v1/admin/reservations/{id}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "RES-20260401-001",
    "organization": "삼성생명 연수팀",
    "purpose": "신입사원 교육",
    "people": 30,
    "customer": "홍길동",
    "customerPhone": "010-1234-5678",
    "customerPhone2": null,
    "customerEmail": "hong@samsung.com",
    "startDate": "2026-04-01",
    "endDate": "2026-04-03",
    "colorCode": "#3b82f6",
    "status": "확정",
    "companyAddress": "서울시 강남구 테헤란로 123",
    "siteManager": "김현장",
    "siteManagerPhone": "010-9999-8888",
    "memo": "채식 메뉴 요청",
    "rooms": [
      {
        "id": 1,
        "roomNumber": "101",
        "reservedDate": "2026-04-01"
      }
    ],
    "classrooms": [
      {
        "id": 1,
        "classroom": "105",
        "reservedDate": "2026-04-01"
      }
    ],
    "meals": [
      {
        "id": 1,
        "mealDate": "2026-04-01",
        "breakfast": 0,
        "lunch": 30,
        "dinner": 30,
        "specialBreakfast": false,
        "specialLunch": false,
        "specialDinner": true
      }
    ]
  }
}
```

### 3-3. 예약 등록

```
POST /v1/admin/reservations
```

**Request**

```json
{
  "organization": "삼성생명 연수팀",
  "purpose": "신입사원 교육",
  "people": 30,
  "customer": "홍길동",
  "customerPhone": "010-1234-5678",
  "customerPhone2": null,
  "customerEmail": "hong@samsung.com",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "colorCode": "#3b82f6",
  "status": "확정",
  "companyAddress": "서울시 강남구 테헤란로 123",
  "siteManager": "김현장",
  "siteManagerPhone": "010-9999-8888",
  "memo": "채식 메뉴 요청",
  "rooms": [
    { "roomNumber": "101", "reservedDate": "2026-04-01" },
    { "roomNumber": "102", "reservedDate": "2026-04-01" }
  ],
  "classrooms": [
    { "classroom": "105", "reservedDate": "2026-04-01" }
  ],
  "meals": [
    {
      "mealDate": "2026-04-01",
      "breakfast": 0,
      "lunch": 30,
      "dinner": 30,
      "specialBreakfast": false,
      "specialLunch": false,
      "specialDinner": true
    }
  ]
}
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "RES-20260401-001"
  }
}
```

### 3-4. 예약 수정

```
PUT /v1/admin/reservations/{id}
```

> Request 형식은 3-3과 동일. 강의실·객실·식사 목록은 기존 데이터를 삭제 후 재생성합니다.

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "RES-20260401-001"
  }
}
```

### 3-5. 예약 취소 (Soft Delete)

```
DELETE /v1/admin/reservations/{id}
```

> 물리적 삭제 없이 status를 "취소"로 변경합니다.

**Response** `204 No Content`

### 3-6. 강의실 이용 가능 여부 확인

```
GET /v1/admin/reservations/check-classroom?classroom={강의실}&date={날짜}
```

**Query Parameters**

| 파라미터   | 필수 | 예시       | 설명      |
| ---------- | ---- | ---------- | --------- |
| classroom  | ✅   | 105        | 강의실 호 |
| date       | ✅   | 2026-04-01 | 확인 날짜 |

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "available": false,
    "organization": "삼성생명 연수팀"
  }
}
```

---

## 4. 설문 (Survey)

### 4-1. 설문 토큰 생성 `🔐`

```
POST /v1/admin/surveys/token/{reservationId}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "token": "abc123xyz...",
    "surveyUrl": "https://www.hka.kr/survey/abc123xyz..."
  }
}
```

### 4-2. 예약별 설문 토큰 조회 `🔐`

```
GET /v1/admin/surveys/token/{reservationId}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "token": "abc123xyz...",
    "isUsed": false
  }
}
```

### 4-3. 전체 토큰 목록 조회 `🔐`

```
GET /v1/admin/surveys/tokens
```

### 4-4. 예약별 설문 응답 조회 `🔐`

```
GET /v1/admin/surveys/{reservationId}
```

### 4-5. 전체 설문 응답 조회 `🔐`

```
GET /v1/admin/surveys
```

### 4-6. 설문 토큰 유효성 확인 (공개)

```
GET /v1/survey/check/{token}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "valid": true,
    "isUsed": false
  }
}
```

### 4-7. 설문 응답 제출 (공개)

```
POST /v1/survey/{token}
```

**Request**

```json
{
  "answer": "{\"satisfaction\":5,\"food\":4,\"facility\":5,\"comment\":\"좋았습니다\"}"
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

---

## 5. 앱 설정 (Settings)

> 🔐 JWT 필요

### 5-1. 설정 조회

```
GET /v1/admin/settings
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "siteName": "흥국생명 연수원",
    "adminEmail": "admin@hka.kr"
  }
}
```

### 5-2. 설정 저장

```
PUT /v1/admin/settings
```

**Request**

```json
{
  "settings": {
    "siteName": "흥국생명 연수원",
    "adminEmail": "admin@hka.kr"
  }
}
```

**Response**

```json
{
  "success": true,
  "message": "성공",
  "data": null
}
```

---

## 공통 에러 응답

```json
{
  "success": false,
  "message": "존재하지 않는 예약입니다.",
  "data": null
}
```

| 상태코드 | 설명                            |
| -------- | ------------------------------- |
| 400      | 잘못된 입력값                   |
| 401      | 인증 실패 (토큰 없음 또는 만료) |
| 403      | 권한 없음                       |
| 404      | 리소스 없음                     |
| 409      | 중복 데이터 (강의실 충돌 등)    |
| 500      | 서버 오류                       |
