package com.heungkuk.academy.domain.reservation.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.heungkuk.academy.domain.reservation.dto.response.ImportResult;
import com.heungkuk.academy.domain.reservation.entity.ClassroomReservation;
import com.heungkuk.academy.domain.reservation.entity.MealReservation;
import com.heungkuk.academy.domain.reservation.entity.Reservation;
import com.heungkuk.academy.domain.reservation.entity.RoomReservation;
import com.heungkuk.academy.domain.reservation.repository.ClassroomReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.MealReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.ReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.RoomReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Excel import 서비스
 *
 * <p>처리 순서:
 * <ol>
 *   <li>Sheet "예약정보" — reservation_code 기준으로 upsert (있으면 수정, 없으면 신규 생성)</li>
 *   <li>처리된 예약의 하위 데이터 전부 삭제 (숙박/강의실/식수) — 재삽입 전 초기화</li>
 *   <li>Sheet "숙박예약" — RoomReservation 재삽입</li>
 *   <li>Sheet "강의실예약" — ClassroomReservation 재삽입</li>
 *   <li>Sheet "식수예약" — MealReservation 재삽입</li>
 * </ol>
 *
 * <p>파일에 없는 기존 예약은 건드리지 않습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final ReservationRepository reservationRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final ClassroomReservationRepository classroomReservationRepository;
    private final MealReservationRepository mealReservationRepository;

    @Transactional
    public ImportResult importAll(MultipartFile file) {

        int created = 0, updated = 0, failed = 0;
        List<String> errors = new ArrayList<>();

        try (XSSFWorkbook wb = new XSSFWorkbook(file.getInputStream())) {

            // ── 1. 예약 기본정보 upsert ───────────────────────────────────────
            // LinkedHashMap 으로 삽입 순서 유지 — 하위 시트 처리 시 같은 순서로 조회
            Map<String, Reservation> codeMap = new LinkedHashMap<>();

            XSSFSheet resSheet = wb.getSheet("예약정보");
            if (resSheet == null) {
                throw new IllegalArgumentException("'예약정보' 시트를 찾을 수 없습니다.");
            }

            for (int i = 1; i <= resSheet.getLastRowNum(); i++) {
                Row row = resSheet.getRow(i);
                if (row == null) continue;

                try {
                    String code = str(row, 0);
                    if (code.isBlank()) continue; // 빈 행 스킵

                    // export 컬럼 순서와 동일하게 읽기
                    // col: 0=예약코드, 1=단체명, 2=목적, 3=인원수, 4=담당자, 5=연락처1,
                    //      6=연락처2, 7=이메일, 8=시작일, 9=종료일, 10=컬러코드, 11=상태,
                    //      12=주소, 13=현장담당자, 14=현장연락처, 15=메모
                    String organization  = str(row, 1);
                    String purpose       = str(row, 2);
                    int    people        = (int) num(row, 3);
                    String customer      = str(row, 4);
                    String phone1        = str(row, 5);
                    String phone2        = str(row, 6);
                    String email         = str(row, 7);
                    LocalDate startDate  = date(str(row, 8));
                    LocalDate endDate    = date(str(row, 9));
                    String colorCode     = str(row, 10);
                    String status        = str(row, 11);
                    String address       = str(row, 12);
                    String siteManager   = str(row, 13);
                    String sitePhone     = str(row, 14);
                    String memo          = str(row, 15);

                    Reservation res = reservationRepository.findByReservationCode(code).orElse(null);

                    if (res != null) {
                        // 기존 예약 → 필드만 업데이트
                        res.updateFromImport(organization, purpose, people, customer,
                                phone1, phone2, email, startDate, endDate,
                                colorCode, status, address, siteManager, sitePhone, memo);
                        updated++;
                    } else {
                        // 신규 예약 — reservation_code를 파일 값 그대로 사용
                        res = reservationRepository.save(Reservation.fromImport(code,
                                organization, purpose, people, customer,
                                phone1, phone2, email, startDate, endDate,
                                colorCode, status, address, siteManager, sitePhone, memo));
                        created++;
                    }

                    codeMap.put(code, res);

                } catch (Exception e) {
                    failed++;
                    errors.add("예약정보 " + (i + 1) + "행: " + e.getMessage());
                    log.warn("예약정보 {}행 처리 실패: {}", i + 1, e.getMessage());
                }
            }

            // ── 2. 처리된 예약의 하위 데이터 초기화 ──────────────────────────
            // import 파일 기준으로 완전히 재구성하기 위해 기존 데이터 삭제
            for (Reservation res : codeMap.values()) {
                roomReservationRepository.deleteByReservation(res);
                classroomReservationRepository.deleteByReservation(res);
                mealReservationRepository.deleteByReservation(res);
            }

            // ── 3. 숙박예약 재삽입 ────────────────────────────────────────────
            // col: 0=예약코드, 1=호실, 2=날짜
            XSSFSheet roomSheet = wb.getSheet("숙박예약");
            if (roomSheet != null) {
                for (int i = 1; i <= roomSheet.getLastRowNum(); i++) {
                    Row row = roomSheet.getRow(i);
                    if (row == null) continue;
                    try {
                        Reservation res = codeMap.get(str(row, 0));
                        if (res == null) continue;
                        roomReservationRepository.save(
                                RoomReservation.of(res, str(row, 1), date(str(row, 2))));
                    } catch (Exception e) {
                        errors.add("숙박예약 " + (i + 1) + "행: " + e.getMessage());
                    }
                }
            }

            // ── 4. 강의실예약 재삽입 ──────────────────────────────────────────
            // col: 0=예약코드, 1=강의실, 2=날짜
            XSSFSheet classSheet = wb.getSheet("강의실예약");
            if (classSheet != null) {
                for (int i = 1; i <= classSheet.getLastRowNum(); i++) {
                    Row row = classSheet.getRow(i);
                    if (row == null) continue;
                    try {
                        Reservation res = codeMap.get(str(row, 0));
                        if (res == null) continue;
                        classroomReservationRepository.save(
                                ClassroomReservation.builder()
                                        .reservation(res)
                                        .classroom(str(row, 1))
                                        .reservedDate(date(str(row, 2)))
                                        .build());
                    } catch (Exception e) {
                        errors.add("강의실예약 " + (i + 1) + "행: " + e.getMessage());
                    }
                }
            }

            // ── 5. 식수예약 재삽입 ────────────────────────────────────────────
            // col: 0=예약코드, 1=날짜, 2=조식, 3=중식, 4=석식, 5=특별조식, 6=특별중식, 7=특별석식
            XSSFSheet mealSheet = wb.getSheet("식수예약");
            if (mealSheet != null) {
                for (int i = 1; i <= mealSheet.getLastRowNum(); i++) {
                    Row row = mealSheet.getRow(i);
                    if (row == null) continue;
                    try {
                        Reservation res = codeMap.get(str(row, 0));
                        if (res == null) continue;
                        mealReservationRepository.save(
                                MealReservation.builder()
                                        .reservation(res)
                                        .mealDate(date(str(row, 1)))
                                        .breakfast((int) num(row, 2))
                                        .lunch((int) num(row, 3))
                                        .dinner((int) num(row, 4))
                                        .specialBreakfast("Y".equalsIgnoreCase(str(row, 5)))
                                        .specialLunch("Y".equalsIgnoreCase(str(row, 6)))
                                        .specialDinner("Y".equalsIgnoreCase(str(row, 7)))
                                        .build());
                    } catch (Exception e) {
                        errors.add("식수예약 " + (i + 1) + "행: " + e.getMessage());
                    }
                }
            }

        } catch (IOException e) {
            log.error("Excel import 실패", e);
            throw new RuntimeException("엑셀 파일을 읽는 중 오류가 발생했습니다.");
        }

        log.info("Excel import 완료 — created:{} updated:{} failed:{}", created, updated, failed);
        return ImportResult.of(created, updated, failed, errors);
    }

    // ── 셀 읽기 유틸 ──────────────────────────────────────────────────────────

    /**
     * 셀을 문자열로 읽기
     *
     * <p>엑셀 셀은 저장된 타입에 따라 읽는 방법이 달라집니다.
     * 예) 숫자처럼 보여도 NUMERIC 타입이면 getStringCellValue()가 오류를 냅니다.
     * 그래서 getCellType()으로 분기 처리합니다.
     */
    private String str(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                // 정수처럼 보이는 숫자(예: 인원수)를 "30" 형식으로
                double v = cell.getNumericCellValue();
                yield v == Math.floor(v) ? String.valueOf((long) v) : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> "";
        };
    }

    /** 셀을 double로 읽기 (인원수, 식수 인원 등 숫자 컬럼용) */
    private double num(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return 0;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING  -> {
                String s = cell.getStringCellValue().trim();
                yield s.isEmpty() ? 0 : Double.parseDouble(s);
            }
            default -> 0;
        };
    }

    /**
     * "yyyy-MM-dd" 형식 문자열 → LocalDate
     *
     * <p>export 시 {@code LocalDate.toString()}으로 저장했기 때문에 ISO 형식이 보장됩니다.
     */
    private LocalDate date(String s) {
        if (s == null || s.isBlank()) throw new IllegalArgumentException("날짜 값이 비어있습니다.");
        return LocalDate.parse(s.trim());
    }
}
