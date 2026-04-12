# Problem & Solution

## Backend

### N+1 쿼리 문제

**문제**
예약 목록 조회 시 `toResponse()` 내부에서 강의실, 객실, 식사 정보를 각각 별도의 repository로 조회하고 있었다. 예약이 N개일 때 1(목록) + N(강의실) + N(객실) + N(식사) 쿼리가 발생하는 N+1 문제가 존재했다.

**원인**
JPA Lazy Loading 방식으로 연관 엔티티를 개별 조회하는 구조였기 때문에 예약 건수에 비례하여 쿼리 수가 증가했다.

**해결 방법**
`findByReservationIn(List<Reservation> reservations)`을 사용하여 예약 목록을 한 번에 넘겨 강의실, 객실, 식사 예약을 각각 1번의 쿼리로 조회했다.

```java
List<ClassroomReservation> findByReservationIn(List<Reservation> reservations);
List<RoomReservation> findByReservationIn(List<Reservation> reservations);
List<MealReservation> findByReservationIn(List<Reservation> reservations);
```

**결과**
- 기존: 1(예약 목록) + 3N(강의실/객실/식사 개별 조회) 쿼리
- 개선: 1(예약 목록) + 3(강의실/객실/식사 각 1번) = 총 4개 쿼리로 감소
- 예약 건수에 상관없이 일정한 쿼리 수 유지
- API 응답시간: 약 1000ms 이상 → 약 376ms로 단축 (약 60% 개선)


## Frontend

### Pretendard 폰트 CDN 사용으로 인한 로딩 지연

**문제**
Pretendard 폰트를 `cdn.jsdelivr.net` 외부 CDN에서 가져오는 방식으로 사용했다. 외부 네트워크 요청으로 인해 최대 750ms의 로딩 지연이 발생했으며 Lighthouse 성능 점수에도 영향을 미쳤다.

**원인**
외부 CDN 서버에 의존하는 구조로, 네트워크 상태나 CDN 서버 응답 속도에 따라 폰트 로딩 시간이 달라졌다.

**해결 방향**
- `next/font/local`을 사용하여 폰트 파일을 직접 서버에서 서빙 (self-hosting)
- 폰트 파일을 `public/fonts/`에 저장하고 Next.js가 최적화하여 제공

**결과**
- 외부 CDN 의존성 제거
- 폰트 로딩 시간 단축
- Lighthouse FCP/LCP 점수 개선
