# Grafana + Loki 로그 모니터링

## 구성 개요

```
Spring 로그파일 → Promtail → Loki → Grafana
```

## Docker Compose 구성

`docker-compose-dev.yml`에 추가된 서비스 (loki, promtail, grafana)

- Grafana 포트: `3001`
- Loki/Promtail은 외부 포트 노출 없이 내부 네트워크 통신
- SMTP 설정은 `.env`에서 관리

## 설정 파일

### loki-config.yaml

- 인증 비활성화 (내부망 전용)
- 스토리지: filesystem
- 스키마: v13, tsdb 인덱스, 24h 롤링
- 7일 이상 된 로그 거부

### promtail-config.yaml

- Loki URL: `http://hka-loki:3100`
- 로그 경로: `/var/log/spring/` (compose에서 `./logs` 마운트)

| job                | 파일            | log_type    |
| ------------------ | --------------- | ----------- |
| spring-app         | app.log         | app         |
| spring-error       | error.log       | error       |
| spring-access      | access.log      | access      |
| spring-auth        | auth.log        | auth        |
| spring-reservation | reservation.log | reservation |

## logback-spring.xml 로그 분리

| appender         | 파일            | 라우팅               |
| ---------------- | --------------- | -------------------- |
| FILE             | app.log         | 전체                 |
| ERROR_FILE       | error.log       | ERROR 레벨만         |
| AUTH_FILE        | auth.log        | global.security      |
| RESERVATION_FILE | reservation.log | domain.reservation   |
| ACCESS_FILE      | access.log      | 각 도메인 controller |

## Grafana 접속

- 로컬: `http://localhost:3001`
- 운영: 추후 `grafana.academy-hk.com` NGINX 연결 예정
- 계정 정보는 `.env` 참고

## Loki 데이터소스 연결

1. Connections → Data sources → Add data source → Loki
2. URL: `http://hka-loki:3100`
3. Save & Test

## 쿼리 예시

```
{log_type="error"}        # 에러 로그
{log_type="auth"}         # 인증 로그
{log_type="reservation"}  # 예약 로그
{job="hka-backend"}       # 전체 로그
```

## 알림 설정

- Alert rule: ERROR 로그 알림
- 조건: `rate({log_type="error"} [5m]) > 0`
- 평가 주기: 5분
- 알림 채널: 이메일 (Contact point 설정)
- SMTP: Gmail 앱 비밀번호 사용 (`.env` 참고)

## .env 필요 항목

```
GRAFANA_PASSWORD=
GRAFANA_SMTP_USER=
GRAFANA_SMTP_PASSWORD=
```

## 향후 작업

- [ ] 운영 서버 이전 후 적용
- [ ] NGINX 로그 JSON 형식 변경 후 Promtail 수집
- [ ] Prometheus 연동 (CPU/메모리 메트릭)
- [ ] grafana.academy-hk.com NGINX 연결
- [ ] 대시보드 패널 추가
