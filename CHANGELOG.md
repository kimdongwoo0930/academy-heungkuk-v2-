# CHANGELOG

## [3.2.0] - 2026-04-11

### Added

- **Grafana 통합 대시보드** (`grafana/dashboards/hka-overview.json`)
  - Spring Boot: Uptime / Heap Used / CPU Usage / HTTP req/s / JVM Heap 추이 / 상태코드별 요청
  - 서버 리소스: CPU 사용률 / 메모리 사용량 / 디스크 사용률 / 네트워크 수신·송신
  - Docker 컨테이너: 컨테이너별 CPU / 메모리 (cAdvisor)
  - 로그: ERROR 발생률 / NGINX 5xx 발생률 / Spring 전체 로그 / Spring 에러 로그 / NGINX Access 로그
  - Grafana Import에서 바로 사용 가능 (`__inputs` 기반 데이터소스 매핑)
- **NGINX 로그 라벨 체계 정리**
  - `log_type: nginx-access` / `log_type: nginx-error` 로 분리
  - Spring `log_type: error` 와 충돌 방지

---

## [3.1.0] - 2026-04-11

### Added

- **Prometheus + 메트릭 모니터링** 구축
  - `node-exporter`: 호스트 CPU / 메모리 / 디스크 수집
  - `cadvisor`: 컨테이너별 자원 사용량 수집
  - `prometheus`: 메트릭 수집 및 15일 보존 (`prometheus.yml`)
  - Spring `Actuator` + `Micrometer` 연동 → `/actuator/prometheus` 엔드포인트
  - SecurityConfig에 `/actuator/health`, `/actuator/prometheus` `permitAll` 추가
- **NGINX 로그 Promtail 수집** 추가
  - `nginx_logs` named volume으로 nginx ↔ promtail 파일 공유
  - `nginx-access` job: JSON 파싱 후 `method`, `status` 라벨 자동 추출
  - `nginx-error` job: 에러 로그 수집
- Grafana `depends_on`에 `prometheus` 추가
- `docs/Grafana-Loki.md` 전체 개편 (로그 + 메트릭 통합 문서)

### Removed

- **로그 뷰어 SSE 실시간 스트림 제거** (Grafana + Loki로 대체)
  - `LogService`: `subscribe()`, `startWatching()`, `broadcast()` 등 SSE 관련 메서드 비활성화
  - `LogController`: `/admin/logs/stream` 엔드포인트 비활성화
  - `JwtAuthenticationFilter`: 쿼리 파라미터 `?token=` 처리 비활성화
  - Next.js `app/api/logs/` 디렉토리 삭제 (`route.ts`, `stream/route.ts`)
  - 설정 페이지 로그 뷰어 탭 및 SSE state / useEffect 제거

---

## [3.x.x] - 2026-04

### Fixed

- 박스 해제시 데이터 삭제 문제 해결
- 예약 날짜 변경시 강의실 중복오류 버그
- SSE 구독자 누적 문제 해결 (AbortController + onerror 시 es.close())
- SSE async dispatch 시 `AuthorizationDeniedException` 수정 (`RequestAttributeSecurityContextRepository` 적용)
- `AsyncRequestNotUsableException` 불필요 에러 로그 억제 (DEBUG 레벨로 처리)
- Docker 로그 한글 깨짐 수정 (`-Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8`)
- 로그 뷰어 초기 로드 한글 깨짐 수정 (UTF-8 바이트 배열 디코딩)
- 로그 실시간 업데이트 안 되던 문제 수정 (WatchService → 500ms 폴링 교체)
- NGINX SSE 버퍼링으로 실시간 전송 안 되던 문제 수정 (`X-Accel-Buffering: no` 헤더 추가)
- 예약 서비스 빌드 오류 수정 (`getGroupName()` → `getOrganization()`)

### Added

- 정산자 동일 버튼 추가
- 확인서 생성
- UX 개선 (토스트 알림, isDirty 저장버튼, 커스텀 확인 다이얼로그)
- N+1 쿼리 개선 (findByReservationIn 적용)
- 예약 삭제 버튼 커스텀 다이얼로그 적용
- 설정 페이지 업데이트 내역 탭 추가
- **로그 뷰어** 추가 (설정 → 로그 탭)
  - app·auth·reservation·access·error 파일별 탭 전환
  - 초기 최근 1000줄 로드
  - SSE 실시간 스트림 (500ms 폴링, 브라우저 → Spring 직접 연결)
  - 키워드 검색, ERROR/WARN/DEBUG 색상 구분
  - 연결 상태 표시 (연결 중 / 실시간)
- 예약 데이터 xlsx 가져오기 (import) 기능 추가
- docker-compose logs 볼륨 마운트 (`./logs:/app/logs`)

### Style

- 예약 모달 스타일 변경
- 예약 마우스 호버시 강의실 확인가능

---

## [2.x.x] - 2026-03

### Added

- 주차별 인쇄 (월요일 시작, 2주씩 A3 한 장, 숙박 빨간 테두리)
- 일정 현황 화면 colspan 스패닝 바
- 숙박·식수 A3 인쇄
- 거래명세서·견적서 다운로드
- 백업 및 복구 기능
- 예약 정렬 토글
- 숙박 현황 날짜 클릭 시 호실 도면 조회
- 특식 구분 및 업체/현장 담당자 정보 필드 추가
- 비밀번호 변경

### Fixed

- 숙소 배정표 날짜 범위 퇴실일(+1일) 반영
- 잔금 미표시 오류
- 연락처 하드코딩 기본값 제거
- 글씨체 프리텐다드로 변경

### Refactor

- Service 인터페이스·Impl 분리
- 일정현황 3개월 범위 조회 최적화

---

## [1.x.x] - 2026-01 ~ 02

### Added

- 설문조사 3단계 멀티스텝 개편 및 결과 UI 개선
- 설문 토큰 만료 처리
- 예약 모달 UX 개선 및 숙박 더블클릭 예약 생성
- 숙박 현황 타입별 서브컬럼 분리
- 일정현황 인쇄, 숙소표 출력

---

## [0.x.x] - 초기 구축

### Added

- 공통 구조, 인증(Auth/Account) 도메인 구현
- Docker Compose, NGINX, Cloudflare SSL 설정
- Swagger 적용 및 백엔드 구조 정리
- 예약 도메인 프론트·백엔드 기본 구현
