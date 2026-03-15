# 📡 API 명세서

> Base URL: `https://api.hka.kr/v1`  
> 인증이 필요한 API는 Header에 `Authorization: Bearer {token}` 필요

---

## 📋 목차

1. [인증 (Auth)](#1-인증-auth)
2. [계정 (Account)](#2-계정-account)
3. [예약 (Reservation)](#3-예약-reservation)
4. [강의실 예약 (Classroom)](#4-강의실-예약-classroom)
5. [객실 예약 (Room)](#5-객실-예약-room)
6. [식사 예약 (Meal)](#6-식사-예약-meal)
7. [설문 (Survey)](#7-설문-survey)

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
  "status": 200,
  "message": "성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 2-2. 계정 생성 (회원가입)

```
POST /v1/auth/signup
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
  "status": 201,
  "message": "성공",
  "data": {
    "id": 2,
    "userId": "staff01",
    "username": "김직원",
    "role": "ROLE_USER",
    "state": false,
    "createdAt": "2025-01-01T00:00:00"
  }
}
```

---

## 2. 계정 (Account)

> 인증 필요 (ROLE_ADMIN만 가능)

### 2-1. 계정 목록 조회

```
GET /v1/admin/accounts
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "userId": "admin",
      "username": "홍길동",
      "role": "ROLE_ADMIN",
      "state": true,
      "createdAt": "2025-01-01T00:00:00"
    }
  ]
}
```

### 2-3. 계정 활성화/비활성화

```
PATCH /v1/admin/accounts/{id}/state
```

**Request**

```json
{
  "state": true
}
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": null
}
```

### 2-4. 계정 삭제

```
DELETE /v1/admin/accounts/{id}
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": null
}
```

---

## 3. 예약 (Reservation)

> 인증 필요

### 3-1. 예약 목록 조회

```
GET /v1/admin/reservations?year=2025&month=3
```

**Query Parameters**

| 파라미터 | 필수 | 설명      |
| -------- | ---- | --------- |
| year     | ✅   | 조회 연도 |
| month    | ✅   | 조회 월   |

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "reservationCode": "HK-20250315-001",
      "organization": "흥국생명",
      "purpose": "신입사원 연수",
      "people": 50,
      "customer": "홍길동",
      "customerPhone": "010-1234-5678",
      "customerPhone2": null,
      "customerEmail": null,
      "startDate": "2025-03-15",
      "endDate": "2025-03-17",
      "colorCode": "#3b82f6",
      "status": "확정",
      "memo": null,
      "createdAt": "2025-01-01T00:00:00"
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
  "status": 200,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "HK-20250315-001",
    "organization": "흥국생명",
    "purpose": "신입사원 연수",
    "people": 50,
    "customer": "홍길동",
    "customerPhone": "010-1234-5678",
    "customerPhone2": null,
    "customerEmail": null,
    "startDate": "2025-03-15",
    "endDate": "2025-03-17",
    "colorCode": "#3b82f6",
    "status": "확정",
    "memo": null,
    "classrooms": [
      {
        "id": 1,
        "classroom": "105",
        "reservedDate": "2025-03-15",
        "startTime": null,
        "endTime": null
      }
    ],
    "rooms": [
      {
        "id": 1,
        "roomNumber": "101",
        "reservedDate": "2025-03-15",
        "checkInTime": null,
        "checkOutTime": null
      }
    ],
    "meals": [
      {
        "id": 1,
        "mealDate": "2025-03-15",
        "breakfast": null,
        "lunch": 50,
        "dinner": 50
      }
    ],
    "createdAt": "2025-01-01T00:00:00"
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
  "organization": "흥국생명",
  "purpose": "신입사원 연수",
  "people": 50,
  "customer": "홍길동",
  "customerPhone": "010-1234-5678",
  "customerPhone2": null,
  "customerEmail": null,
  "startDate": "2025-03-15",
  "endDate": "2025-03-17",
  "colorCode": "#3b82f6",
  "status": "확정",
  "memo": null,
  "classrooms": [
    {
      "classroom": "105",
      "reservedDate": "2025-03-15",
      "startTime": null,
      "endTime": null
    }
  ],
  "rooms": [
    {
      "roomNumber": "101",
      "reservedDate": "2025-03-15",
      "checkInTime": null,
      "checkOutTime": null
    }
  ],
  "meals": [
    {
      "mealDate": "2025-03-15",
      "breakfast": null,
      "lunch": 50,
      "dinner": 50
    }
  ]
}
```

**Response**

```json
{
  "status": 201,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "HK-20250315-001"
  }
}
```

### 3-4. 예약 수정

```
PUT /v1/admin/reservations/{id}
```

**Request** _(3-3과 동일한 형식)_

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": {
    "id": 1,
    "reservationCode": "HK-20250315-001"
  }
}
```

### 3-5. 예약 삭제

```
DELETE /v1/admin/reservations/{id}
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": null
}
```

### 3-6. 예약 상태 변경

```
PATCH /v1/admin/reservations/{id}/status
```

**Request**

```json
{
  "status": "확정"
}
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": null
}
```

---

## 4. 강의실 예약 (Classroom)

> 인증 필요

### 4-1. 강의실 예약 현황 조회 (월별)

```
GET /v1/admin/classrooms?year=2025&month=3
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "classroom": "105",
      "reservedDate": "2025-03-15",
      "organization": "흥국생명",
      "colorCode": "#3b82f6",
      "reservationId": 1
    }
  ]
}
```

---

## 5. 객실 예약 (Room)

> 인증 필요

### 5-1. 객실 예약 현황 조회 (월별)

```
GET /v1/admin/rooms?year=2025&month=3
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "reservedDate": "2025-03-15",
      "organization": "흥국생명",
      "colorCode": "#3b82f6",
      "reservationId": 1,
      "roomCount": 5
    }
  ]
}
```

---

## 6. 식사 예약 (Meal)

> 인증 필요

### 6-1. 식사 현황 조회 (월별)

```
GET /v1/admin/meals?year=2025&month=3
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "mealDate": "2025-03-15",
      "breakfast": null,
      "lunch": 50,
      "dinner": 50
    }
  ]
}
```

---

## 7. 설문 (Survey)

### 7-1. 설문 토큰 생성

> 인증 필요

```
POST /v1/admin/survey/tokens
```

**Request**

```json
{
  "organization": "흥국생명",
  "expiredAt": "2025-04-01T00:00:00"
}
```

**Response**

```json
{
  "status": 201,
  "message": "성공",
  "data": {
    "token": "abc123xyz...",
    "surveyUrl": "https://www.hka.kr/survey/abc123xyz..."
  }
}
```

### 7-2. 설문 응답 제출

> 인증 불필요

```
POST /v1/survey/{token}
```

**Request**

```json
{
  "answer": {
    "satisfaction": 5,
    "food": 4,
    "facility": 5,
    "comment": "좋았습니다"
  }
}
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": null
}
```

### 7-3. 설문 결과 조회

> 인증 필요

```
GET /v1/admin/survey/results
```

**Response**

```json
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "organization": "흥국생명",
      "answer": {
        "satisfaction": 5,
        "food": 4,
        "facility": 5,
        "comment": "좋았습니다"
      },
      "createdAt": "2025-03-17T00:00:00"
    }
  ]
}
```

---

## 🚨 공통 에러 응답

```json
{
  "status": 404,
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
| 409      | 중복 데이터                     |
| 500      | 서버 오류                       |

---

> ⚠️ 개발하면서 추가/수정 예정
