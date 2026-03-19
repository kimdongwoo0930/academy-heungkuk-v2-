-- ============================================================
-- 흥국생명 연수원 관리 시스템 v2.0 — 더미 데이터
-- 출처: 2018년도 방문업체 리스트 → 2025년 날짜로 변환
-- 실행 순서: reservation → classroom_reservation → room_reservation → meal_reservation
-- ============================================================

USE academy_heungkuk;

-- ============================================================
-- 1. reservation
-- ============================================================
INSERT INTO reservation (reservation_code, organization, purpose, people, customer, customer_phone, customer_phone2, customer_email, start_date, end_date, color_code, status, memo, created_at, updated_at) VALUES
('R2025001', '유니프로컨설팅',        '직원 어학연수 (일본어)',       25, '박상준', '010-4523-5423', '031-8003-4827', 'suncool21@hanmail.net',        '2025-01-06', '2025-01-10', '#4A90D9', '확정', NULL, NOW(), NOW()),
('R2025002', 'LNS컨설팅',            'HRD 직무역량 교육',           18, '이수웅', '010-7336-3996', '02-858-7992',   'sylee_lns@daum.net',           '2025-01-13', '2025-01-15', '#E67E22', '확정', NULL, NOW(), NOW()),
('R2025003', '우리산업',              '신입사원 입문 교육',           30, '임학송', '010-8000-5544', '031-201-6544', 'lhs1016@woory.com',            '2025-01-20', '2025-01-20', '#27AE60', '확정', NULL, NOW(), NOW()),
('R2025004', 'SK하이닉스',            '팀장급 리더십 과정',           40, '김민정', '010-8800-9443', NULL,           'minkyung2.kim@sk.com',         '2025-02-03', '2025-02-04', '#8E44AD', '확정', NULL, NOW(), NOW()),
('R2025005', '오티스엘리베이터',       '안전관리 교육',               22, '장석재', '010-5774-5959', '02-6007-3591', 'Stanley.jang@otis.com',        '2025-02-10', '2025-02-11', '#E74C3C', '확정', NULL, NOW(), NOW()),
('R2025006', '경기도건설지부',         '노조 간부 교육',              50, '김소희', '010-4803-4896', '031-722-2929', 'kkunno@hanmail.net',           '2025-02-17', '2025-02-18', '#F39C12', '확정', NULL, NOW(), NOW()),
('R2025007', '아성프리아',             '임원 전략 워크샵',            15, '조연홍', '070-4209-0745', NULL,           'yhcho@asung.com',              '2025-02-24', '2025-02-25', '#1ABC9C', '확정', NULL, NOW(), NOW()),
('R2025008', '지이에이치실',           '전략기획 워크샵',             20, '박찬호', '010-9173-3354', NULL,           'chp@ghr.or.kr',                '2025-03-03', '2025-03-04', '#2980B9', '확정', NULL, NOW(), NOW()),
('R2025009', '아이에스티엔',           '직원 역량 강화 교육',         28, '조수연', '010-2580-3750', '070-4700-2325','sycho11@istn.co.kr',           '2025-03-10', '2025-03-11', '#D35400', '확정', NULL, NOW(), NOW()),
('R2025010', '한국아인티비',           '기술 교육 2차 (수원공고)',     35, '장재민', '010-4423-0903', '031-296-0601', 'entc06@naver.com',             '2025-03-17', '2025-03-18', '#C0392B', '확정', NULL, NOW(), NOW()),
('R2025011', '원해이',                 '팀빌딩 세미나',               12, '김기범', '010-9289-0001', NULL,           'kimgb@wonhei.com',             '2025-03-24', '2025-03-24', '#7F8C8D', '확정', NULL, NOW(), NOW()),
('R2025012', '한온이앤씨',             '신년 전략 워크샵',            45, '이연우', '010-6413-5808', '02-2186-6050', 'leejw@haneun.co.kr',           '2025-03-26', '2025-03-27', '#16A085', '확정', NULL, NOW(), NOW()),
('R2025013', '현대모비스',             'R&D 연구원 세미나',           60, '박영시', '010-3005-9580', '031-260-1176', 'yspark88@mobis.co.kr',         '2025-04-07', '2025-04-07', '#2ECC71', '확정', NULL, NOW(), NOW()),
('R2025014', '삼성전자서비스',         '현장 서비스 역량 교육',       38, '정석재', '010-7138-8640', '031-270-2575', 'sc81.jung@samsung.com',        '2025-04-14', '2025-04-14', '#3498DB', '확정', NULL, NOW(), NOW()),
('R2025015', '경기도건설지부',         '노조 정기 교육 (4월)',        55, '최은영', '010-2005-0814', '031-8000-1381','ey83.choi@samsung.com',        '2025-04-21', '2025-04-22', '#F39C12', '확정', NULL, NOW(), NOW()),
('R2025016', '풀무원건설노조',         '리더십 개발 과정',            32, '이성도', '010-4162-6804', NULL,           'lsd@pulmuone.co.kr',           '2025-04-28', '2025-04-29', '#9B59B6', '확정', NULL, NOW(), NOW()),
('R2025017', '한국아동청소년그룹홈협의회','직원 역량 강화',            24, '이재우', '010-6246-3838', '070-4849-4644','grouphome2008@daum.net',       '2025-05-12', '2025-05-13', '#E91E63', '확정', NULL, NOW(), NOW()),
('R2025018', '그랜라이트',             '임직원 직무 교육',            16, '최군영', '010-7134-0417', NULL,           'kychoi0417@gmail.com',         '2025-05-19', '2025-05-20', '#FF5722', '확정', NULL, NOW(), NOW()),
('R2025019', '한국보건복지인력개발원', '전문인력 교육 과정',          70, '김혜진', '010-5282-3172', '02-3299-1445', 'kimhj@kohi.or.kr',             '2025-05-26', '2025-05-27', '#009688', '확정', NULL, NOW(), NOW()),
('R2025020', '삼성디스플레이',         '기술 혁신 교육',              45, '최은영', '010-2005-0814', '031-8000-1381','ey83.choi@samsung.com',        '2025-06-02', '2025-06-03', '#3498DB', '확정', NULL, NOW(), NOW()),
('R2025021', '퍼름',                   '건강 관리 세미나',            20, '신혜정', '010-9383-3992', NULL,           'shj0923@purme.org',            '2025-06-09', '2025-06-10', '#FF9800', '확정', NULL, NOW(), NOW()),
('R2025022', '중원테크',               '임원 리더십 교육',            18, '이상국', '010-6270-4712', '02-417-9273',  'isg1010@naver.com',            '2025-06-16', '2025-06-17', '#607D8B', '확정', NULL, NOW(), NOW()),
('R2025023', '서울생명의전화',         '상담사 전문 교육',            28, '김봉수', '010-7670-0714', NULL,           'lifeline9195@hanmail.net',     '2025-07-07', '2025-07-08', '#F44336', '대기', NULL, NOW(), NOW()),
('R2025024', '비젼텍',                 '신기술 혁신 과정',            22, '이성미', '010-8716-8730', '031-789-0404', 'leekap@cmentech.co.kr',        '2025-07-14', '2025-07-15', '#673AB7', '확정', NULL, NOW(), NOW()),
('R2025025', '조위스컴퍼니',           '뷰티 전문가 교육',            15, '오화랑', '010-7432-3778', '031-706-7950', 'hroh@chowis.com',              '2025-07-21', '2025-07-22', '#EC407A', '확정', NULL, NOW(), NOW());


-- ============================================================
-- 2. classroom_reservation
-- 강의실: 대강당, 제1강의실, 제2강의실, 세미나실A, 세미나실B
-- ============================================================
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025001';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025001' AND DATEDIFF(r.end_date, r.start_date) >= 1;
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 2 DAY), '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025001' AND DATEDIFF(r.end_date, r.start_date) >= 2;
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 3 DAY), '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025001' AND DATEDIFF(r.end_date, r.start_date) >= 3;
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', DATE_ADD(r.start_date, INTERVAL 4 DAY), '09:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025001' AND DATEDIFF(r.end_date, r.start_date) >= 4;

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025002';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025002' AND DATEDIFF(r.end_date, r.start_date) >= 1;
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', DATE_ADD(r.start_date, INTERVAL 2 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025002' AND DATEDIFF(r.end_date, r.start_date) >= 2;

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', r.start_date, '10:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025003';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025004';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025004';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025005';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '12:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025005';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025006';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '16:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025006';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025007';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025007';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', r.start_date, '10:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025008';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '14:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025008';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025009';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025009';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025010';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '16:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025010';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', r.start_date, '13:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025011';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025012';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025012';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', r.start_date, '10:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025013';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025014';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025015';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025015';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025016';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '14:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025016';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025017';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '16:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025017';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025018';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '13:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025018';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025019';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025019';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'A101',    r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025020';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025020';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', r.start_date, '10:00:00', '17:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025021';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '14:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025021';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', r.start_date, '10:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025022';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B102', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '13:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025022';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025023';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'B101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '16:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025023';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', r.start_date, '09:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025024';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C102', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '15:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025024';

INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', r.start_date, '10:00:00', '18:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025025';
INSERT INTO classroom_reservation (reservation_id, classroom, reserved_date, start_time, end_time, created_at, updated_at)
SELECT r.id, 'C101', DATE_ADD(r.start_date, INTERVAL 1 DAY), '09:00:00', '14:00:00', NOW(), NOW() FROM reservation r WHERE r.reservation_code = 'R2025025';


-- ============================================================
-- 3. room_reservation (숙소)
-- 객실 번호: 201~215, 301~315
-- 각 예약의 숙박일별로 객실 배정
-- ============================================================
-- 프로시저로 각 예약의 start~end 기간 × 객실 수 생성
-- (간결성을 위해 주요 예약만 직접 INSERT)

-- R2025001 유니프로컨설팅 25명 — 201~213 (4박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, day_date, '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213'
) rooms
JOIN (
  SELECT '2025-01-06' AS day_date UNION SELECT '2025-01-07' UNION SELECT '2025-01-08' UNION SELECT '2025-01-09'
) days
WHERE r.reservation_code = 'R2025001';

-- R2025002 LNS컨설팅 18명 — 201~209 (2박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, day_date, '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209'
) rooms
JOIN (
  SELECT '2025-01-13' AS day_date UNION SELECT '2025-01-14'
) days
WHERE r.reservation_code = 'R2025002';

-- R2025004 SK하이닉스 40명 — 201~215 + 301~305 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-02-03', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215'
  UNION SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305'
) rooms
WHERE r.reservation_code = 'R2025004';

-- R2025005 오티스엘리베이터 22명 — 201~211 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-02-10', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210' UNION SELECT '211'
) rooms
WHERE r.reservation_code = 'R2025005';

-- R2025006 경기도건설지부 50명 — 201~215 + 301~310 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-02-17', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215'
  UNION SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305'
  UNION SELECT '306' UNION SELECT '307' UNION SELECT '308' UNION SELECT '309' UNION SELECT '310'
) rooms
WHERE r.reservation_code = 'R2025006';

-- R2025012 한온이앤씨 45명 — 201~215 + 301~307 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-03-26', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215'
  UNION SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305'
  UNION SELECT '306' UNION SELECT '307'
) rooms
WHERE r.reservation_code = 'R2025012';

-- R2025015 경기도건설지부 55명 — 201~215 + 301~312 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-04-21', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215'
  UNION SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305'
  UNION SELECT '306' UNION SELECT '307' UNION SELECT '308' UNION SELECT '309' UNION SELECT '310'
  UNION SELECT '311' UNION SELECT '312'
) rooms
WHERE r.reservation_code = 'R2025015';

-- R2025019 한국보건복지인력개발원 70명 — 201~215 + 301~315 (1박)
INSERT INTO room_reservation (reservation_id, room_number, reserved_date, check_in_time, check_out_time, created_at, updated_at)
SELECT r.id, room_no, '2025-05-26', '15:00:00', '11:00:00', NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '201' AS room_no UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205'
  UNION SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210'
  UNION SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215'
  UNION SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305'
  UNION SELECT '306' UNION SELECT '307' UNION SELECT '308' UNION SELECT '309' UNION SELECT '310'
  UNION SELECT '311' UNION SELECT '312' UNION SELECT '313' UNION SELECT '314' UNION SELECT '315'
) rooms
WHERE r.reservation_code = 'R2025019';


-- ============================================================
-- 4. meal_reservation (식수)
-- 숙박 예약에 대해 날짜별 식수 등록
-- ============================================================
INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-01-06' AS day_date, NULL AS bkf, 25 AS lun, 25 AS din
  UNION SELECT '2025-01-07', 25, 25, 25
  UNION SELECT '2025-01-08', 25, 25, 25
  UNION SELECT '2025-01-09', 25, 25, 25
  UNION SELECT '2025-01-10', 25, 25, NULL
) days
WHERE r.reservation_code = 'R2025001';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-01-13' AS day_date, NULL AS bkf, 18 AS lun, 18 AS din
  UNION SELECT '2025-01-14', 18, 18, 18
  UNION SELECT '2025-01-15', 18, 18, NULL
) days
WHERE r.reservation_code = 'R2025002';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, '2025-01-20', NULL, 30, NULL, NOW(), NOW()
FROM reservation r WHERE r.reservation_code = 'R2025003';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-02-03' AS day_date, NULL AS bkf, 40 AS lun, 40 AS din
  UNION SELECT '2025-02-04', 40, 40, NULL
) days
WHERE r.reservation_code = 'R2025004';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-02-10' AS day_date, NULL AS bkf, 22 AS lun, 22 AS din
  UNION SELECT '2025-02-11', 22, 22, NULL
) days
WHERE r.reservation_code = 'R2025005';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-02-17' AS day_date, NULL AS bkf, 50 AS lun, 50 AS din
  UNION SELECT '2025-02-18', 50, 50, NULL
) days
WHERE r.reservation_code = 'R2025006';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-02-24' AS day_date, NULL AS bkf, 15 AS lun, 15 AS din
  UNION SELECT '2025-02-25', 15, 15, NULL
) days
WHERE r.reservation_code = 'R2025007';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-03-03' AS day_date, NULL AS bkf, 20 AS lun, 20 AS din
  UNION SELECT '2025-03-04', 20, 20, NULL
) days
WHERE r.reservation_code = 'R2025008';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-03-10' AS day_date, NULL AS bkf, 28 AS lun, 28 AS din
  UNION SELECT '2025-03-11', 28, 28, NULL
) days
WHERE r.reservation_code = 'R2025009';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-03-17' AS day_date, NULL AS bkf, 35 AS lun, 35 AS din
  UNION SELECT '2025-03-18', 35, 35, NULL
) days
WHERE r.reservation_code = 'R2025010';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, '2025-03-24', NULL, 12, NULL, NOW(), NOW()
FROM reservation r WHERE r.reservation_code = 'R2025011';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-03-26' AS day_date, NULL AS bkf, 45 AS lun, 45 AS din
  UNION SELECT '2025-03-27', 45, 45, NULL
) days
WHERE r.reservation_code = 'R2025012';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, '2025-04-07', NULL, 60, NULL, NOW(), NOW()
FROM reservation r WHERE r.reservation_code = 'R2025013';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, '2025-04-14', NULL, 38, NULL, NOW(), NOW()
FROM reservation r WHERE r.reservation_code = 'R2025014';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-04-21' AS day_date, NULL AS bkf, 55 AS lun, 55 AS din
  UNION SELECT '2025-04-22', 55, 55, NULL
) days
WHERE r.reservation_code = 'R2025015';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-04-28' AS day_date, NULL AS bkf, 32 AS lun, 32 AS din
  UNION SELECT '2025-04-29', 32, 32, NULL
) days
WHERE r.reservation_code = 'R2025016';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-05-12' AS day_date, NULL AS bkf, 24 AS lun, 24 AS din
  UNION SELECT '2025-05-13', 24, 24, NULL
) days
WHERE r.reservation_code = 'R2025017';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-05-19' AS day_date, NULL AS bkf, 16 AS lun, 16 AS din
  UNION SELECT '2025-05-20', 16, 16, NULL
) days
WHERE r.reservation_code = 'R2025018';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-05-26' AS day_date, NULL AS bkf, 70 AS lun, 70 AS din
  UNION SELECT '2025-05-27', 70, 70, NULL
) days
WHERE r.reservation_code = 'R2025019';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-06-02' AS day_date, NULL AS bkf, 45 AS lun, 45 AS din
  UNION SELECT '2025-06-03', 45, 45, NULL
) days
WHERE r.reservation_code = 'R2025020';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-06-09' AS day_date, NULL AS bkf, 20 AS lun, 20 AS din
  UNION SELECT '2025-06-10', 20, 20, NULL
) days
WHERE r.reservation_code = 'R2025021';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-06-16' AS day_date, NULL AS bkf, 18 AS lun, 18 AS din
  UNION SELECT '2025-06-17', 18, 18, NULL
) days
WHERE r.reservation_code = 'R2025022';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-07-07' AS day_date, NULL AS bkf, 28 AS lun, 28 AS din
  UNION SELECT '2025-07-08', 28, 28, NULL
) days
WHERE r.reservation_code = 'R2025023';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-07-14' AS day_date, NULL AS bkf, 22 AS lun, 22 AS din
  UNION SELECT '2025-07-15', 22, 22, NULL
) days
WHERE r.reservation_code = 'R2025024';

INSERT INTO meal_reservation (reservation_id, meal_date, breakfast, lunch, dinner, created_at, updated_at)
SELECT r.id, day_date, bkf, lun, din, NOW(), NOW()
FROM reservation r
JOIN (
  SELECT '2025-07-21' AS day_date, NULL AS bkf, 15 AS lun, 15 AS din
  UNION SELECT '2025-07-22', 15, 15, NULL
) days
WHERE r.reservation_code = 'R2025025';
