package com.heungkuk.academy.domain.reservation.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.heungkuk.academy.domain.reservation.entity.ClassroomReservation;
import com.heungkuk.academy.domain.reservation.entity.MealReservation;
import com.heungkuk.academy.domain.reservation.entity.Reservation;
import com.heungkuk.academy.domain.reservation.entity.RoomReservation;
import com.heungkuk.academy.domain.reservation.repository.ClassroomReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.MealReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.ReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.RoomReservationRepository;
import com.heungkuk.academy.domain.setting.entity.AppSetting;
import com.heungkuk.academy.domain.setting.repository.AppSettingRepository;
import com.heungkuk.academy.global.exception.BusinessException;
import com.heungkuk.academy.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 견적서 생성 서비스
 *
 * 동작 방식: 1. classpath 의 템플릿 xlsx(estimate_template.xlsx)를 메모리에 열기 2. POI로 미리 지정된 셀 위치에 값을 덮어쓰기 (기존
 * 서식·병합셀 유지) 3. byte[] 로 변환 후 반환 → 컨트롤러가 파일 다운로드 응답으로 내려줌
 *
 * 셀 위치는 0-indexed (Excel row 9 = index 8, col D = index 3)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExcelEstimateService {

    private final ReservationRepository reservationRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final ClassroomReservationRepository classroomReservationRepository;
    private final MealReservationRepository mealReservationRepository;
    private final AppSettingRepository appSettingRepository;

    // ── 숙박 호실번호 → 타입 매핑 ─────────────────────────────────────────────
    private static final Map<String, String> ROOM_TYPE =
            Map.ofEntries(Map.entry("101", "4인실"), Map.entry("102", "4인실"), Map.entry("103", "4인실"),
                    Map.entry("104", "4인실"), Map.entry("105", "4인실"), Map.entry("106", "4인실"),
                    Map.entry("107", "4인실"), Map.entry("108", "4인실"), Map.entry("109", "1인실"),
                    Map.entry("110", "2인실"), Map.entry("111", "2인실"), Map.entry("112", "4인실"),
                    Map.entry("113", "4인실"), Map.entry("114", "4인실"), Map.entry("115", "4인실"),
                    Map.entry("116", "4인실"), Map.entry("117", "4인실"), Map.entry("118", "4인실"),
                    Map.entry("119", "4인실"), Map.entry("120", "4인실"), Map.entry("121", "4인실"),
                    Map.entry("122", "4인실"), Map.entry("123", "4인실"), Map.entry("124", "4인실"),
                    Map.entry("125", "4인실"), Map.entry("126", "1인실"), Map.entry("127", "2인실"));

    // ── 강의실 호실번호 → 견적서 카테고리 매핑 ────────────────────────────────
    private static final Map<String, String> CLASSROOM_CATEGORY = Map.ofEntries(
            Map.entry("105", "대형(120인)"), Map.entry("201", "중형(70인)"), Map.entry("203", "중형(50인)"),
            Map.entry("204", "중형(50인)"), Map.entry("101", "소형(30인)"), Map.entry("103", "소형(30인)"),
            Map.entry("202", "소형(30인)"), Map.entry("102", "소형(20인)"), Map.entry("106", "분임실(12인)"),
            Map.entry("107", "분임실(12인)"), Map.entry("205", "분임실(12인)"),
            Map.entry("206", "분임실(12인)"), Map.entry("A", "다목적실"), Map.entry("B", "다목적실"));

    // ── 강의실 카테고리 → 견적서 row index (0-based) ──────────────────────────
    // Excel row 22 = index 21, row 23 = index 22, ...
    // row 27 (소형20인 진행실)은 견적서에 있지만 DB에 별도 카테고리가 없어서 제외
    private static final Map<String, Integer> CLASSROOM_ROW = Map.of("대형(120인)", 21, "중형(70인)", 22,
            "중형(50인)", 23, "소형(30인)", 24, "소형(20인)", 25, "분임실(12인)", 27, "다목적실", 28);

    // ── 공개 API ──────────────────────────────────────────────────────────────

    public byte[] generateEstimate(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        List<RoomReservation> rooms = roomReservationRepository.findByReservation(res);
        List<ClassroomReservation> classrooms =
                classroomReservationRepository.findByReservation(res);
        List<MealReservation> meals = mealReservationRepository.findByReservation(res);

        Map<String, String> settings = appSettingRepository.findAll().stream()
                .collect(Collectors.toMap(AppSetting::getSettingKey, AppSetting::getSettingValue));

        long roomPrice = toLong(settings.getOrDefault("price.room", "85000"));
        long mealPrice = toLong(settings.getOrDefault("price.meal", "8300"));
        long specialMealPrice = toLong(settings.getOrDefault("price.specialMeal", "35000"));

        // 템플릿을 classpath에서 스트림으로 열기
        try (InputStream is = getClass().getResourceAsStream("/templates/estimate_template.xlsx");
                XSSFWorkbook wb = new XSSFWorkbook(is)) {

            XSSFSheet sheet = wb.getSheetAt(0);

            fillHeader(sheet, res, settings);
            long[] facilityTotals = fillRooms(sheet, rooms, roomPrice);
            long[] classroomTotals = fillClassrooms(sheet, classrooms, settings);
            fillFacilityTotals(sheet, facilityTotals, classroomTotals);
            long[] mealTotals = fillMeals(sheet, meals, mealPrice, specialMealPrice);
            fillGrandTotals(sheet, facilityTotals, classroomTotals, mealTotals);
            fillMealTable(sheet, meals);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("견적서 생성 실패 reservationId={}", reservationId, e);
            throw new RuntimeException("견적서 생성 중 오류가 발생했습니다.");
        }
    }

    // ── 단계별 채우기 메서드 ──────────────────────────────────────────────────

    /** 헤더 영역: 단체명, 날짜, 담당자, 기간 */
    private void fillHeader(XSSFSheet sheet, Reservation res, Map<String, String> settings) {
        setStr(sheet, 4, 0, res.getOrganization()); // A5: 수신 단체명
        setDate(sheet, 8, 3, LocalDate.now()); // D9: 견적일자
        setStr(sheet, 9, 3, res.getCustomer() + "님"); // D10: 고객사 담당자
        setStr(sheet, 10, 3, res.getCustomerPhone()); // D11: 연락처
        setStr(sheet, 11, 3, nvl(res.getCustomerEmail())); // D12: 이메일
        setStr(sheet, 13, 3, res.getOrganization()); // D14: 회사명
        setStr(sheet, 14, 3, nvl(res.getPurpose())); // D15: 교육명칭
        setDate(sheet, 15, 2, res.getStartDate()); // C16: 시작일
        setDate(sheet, 15, 9, res.getEndDate()); // J16: 종료일

        // 연수원 측 정보 (O열 = index 14)
        String representative = settings.getOrDefault("contact.representative", "");
        String manager = settings.getOrDefault("contact.manager", "");
        String phone = settings.getOrDefault("contact.phone", "");
        String fax = settings.getOrDefault("contact.fax", "");
        String email = settings.getOrDefault("contact.email", "");

        setStr(sheet, 5, 14, representative); // O6: 대표이사
        setStr(sheet, 8, 14, manager); // O9: 담당자
        setStr(sheet, 9, 14, "T. " + phone + "     F. " + fax); // O10: 전화/팩스
        setStr(sheet, 10, 14, email); // O11: 이메일
    }

    /**
     * 숙박비: 타입(4인실/2인실/1인실) 별로 row 19/20/21 에 채움
     *
     * @return [subtotal, tax] 합계 배열
     */
    private long[] fillRooms(XSSFSheet sheet, List<RoomReservation> rooms, long roomPrice) {
        String[] typeKeys = {"4인실", "2인실", "1인실"};
        Map<String, List<RoomReservation>> byType = rooms.stream().collect(
                Collectors.groupingBy(r -> ROOM_TYPE.getOrDefault(r.getRoomNumber(), "4인실")));

        long totalSubtotal = 0, totalTax = 0;

        for (int ti = 0; ti < typeKeys.length; ti++) {
            int rowIdx = 18 + ti; // row 19=18, row 20=19, row 21=20
            List<RoomReservation> typeRooms = byType.getOrDefault(typeKeys[ti], List.of());

            if (typeRooms.isEmpty()) {
                blankCell(sheet, rowIdx, 5);  // F: 박 수
                blankCell(sheet, rowIdx, 8);  // I: 실 수
                setLong(sheet, rowIdx, 11, roomPrice); // L: 단가
                blankCell(sheet, rowIdx, 13); // N: 공급가액
                blankCell(sheet, rowIdx, 16); // Q: 세액
                blankCell(sheet, rowIdx, 19); // T: 합계
                continue;
            }

            long nights =
                    typeRooms.stream().map(RoomReservation::getReservedDate).distinct().count();
            long roomCount =
                    typeRooms.stream().map(RoomReservation::getRoomNumber).distinct().count();
            long subtotal = nights * roomCount * roomPrice;
            long tax = Math.round(subtotal * 0.1);

            setLongNz(sheet, rowIdx, 5, nights); // F: 박 수
            setLongNz(sheet, rowIdx, 8, roomCount); // I: 실 수
            setLong(sheet, rowIdx, 11, roomPrice); // L: 단가
            setLongNz(sheet, rowIdx, 13, subtotal); // N: 공급가액
            setLongNz(sheet, rowIdx, 16, tax); // Q: 세액
            setLongNz(sheet, rowIdx, 19, subtotal + tax); // T: 합계

            totalSubtotal += subtotal;
            totalTax += tax;
        }
        return new long[] {totalSubtotal, totalTax};
    }

    /**
     * 강의실비: 카테고리별로 해당 row 에 채움
     *
     * @return [subtotal, tax]
     */
    private long[] fillClassrooms(XSSFSheet sheet, List<ClassroomReservation> classrooms,
            Map<String, String> settings) {

        // 전체 강의실 row 초기화 (단가 설정, 나머지 blank)
        for (Map.Entry<String, Integer> e : CLASSROOM_ROW.entrySet()) {
            int rowIdx = e.getValue();
            long catPrice = toLong(settings.getOrDefault("price.classroom." + e.getKey(), "0"));
            blankCell(sheet, rowIdx, 5);  // F: 일 수
            blankCell(sheet, rowIdx, 8);  // I: 실 수
            setLong(sheet, rowIdx, 11, catPrice); // L: 단가
            blankCell(sheet, rowIdx, 13); // N: 공급가액 (formula 제거)
            blankCell(sheet, rowIdx, 16); // Q: 세액 (formula 제거)
            blankCell(sheet, rowIdx, 19); // T: 합계 (formula 제거)
        }

        // 소형(20인) 진행실 행(row 27, index 26) — DB 카테고리 없음, formula 제거 후 숨김
        blankCell(sheet, 26, 13);
        blankCell(sheet, 26, 16);
        blankCell(sheet, 26, 19);
        Row progressRow = sheet.getRow(26);
        if (progressRow == null) progressRow = sheet.createRow(26);
        progressRow.setZeroHeight(true);

        Map<String, List<ClassroomReservation>> byCategory = classrooms.stream()
                .filter(c -> CLASSROOM_CATEGORY.containsKey(c.getClassroom()))
                .collect(Collectors.groupingBy(c -> CLASSROOM_CATEGORY.get(c.getClassroom())));

        long totalSubtotal = 0, totalTax = 0;

        for (Map.Entry<String, List<ClassroomReservation>> entry : byCategory.entrySet()) {
            Integer rowIdx = CLASSROOM_ROW.get(entry.getKey());
            if (rowIdx == null)
                continue;

            List<ClassroomReservation> list = entry.getValue();
            long catPrice = toLong(settings.getOrDefault("price.classroom." + entry.getKey(), "0"));
            long days = list.stream().map(ClassroomReservation::getReservedDate).distinct().count();
            long catCount =
                    list.stream().map(ClassroomReservation::getClassroom).distinct().count();
            long subtotal = days * catCount * catPrice;
            long tax = Math.round(subtotal * 0.1);

            setLongNz(sheet, rowIdx, 5, days); // F: 일 수
            setLongNz(sheet, rowIdx, 8, catCount); // I: 실 수
            setLong(sheet, rowIdx, 11, catPrice); // L: 단가
            setLongNz(sheet, rowIdx, 13, subtotal); // N: 공급가액
            setLongNz(sheet, rowIdx, 16, tax); // Q: 세액
            setLongNz(sheet, rowIdx, 19, subtotal + tax); // T: 합계

            totalSubtotal += subtotal;
            totalTax += tax;
        }
        return new long[] {totalSubtotal, totalTax};
    }

    /** 계 / 할인 / 시설 계 row 채움 */
    private void fillFacilityTotals(XSSFSheet sheet, long[] roomTotals, long[] classroomTotals) {
        long subtotal = roomTotals[0] + classroomTotals[0];
        long tax = roomTotals[1] + classroomTotals[1];

        setLongNz(sheet, 29, 13, subtotal); // N30: 계 공급가액
        setLongNz(sheet, 29, 16, tax); // Q30: 계 세액
        setLongNz(sheet, 29, 19, subtotal + tax); // T30: 계 합계

        // N31: 할인 — 0이면 빈칸

        setLongNz(sheet, 31, 13, subtotal); // N32: 시설계 공급가액
        setLongNz(sheet, 31, 16, tax); // Q32: 시설계 세액
        setLongNz(sheet, 31, 19, subtotal + tax); // T32: 시설계 합계
    }

    /**
     * 식비: 일반식 / 특식 row 채움
     *
     * @return [normalSubtotal, normalTax, specialSubtotal, specialTax]
     */
    private long[] fillMeals(XSSFSheet sheet, List<MealReservation> meals, long mealPrice,
            long specialMealPrice) {
        int totalNormal = 0, totalSpecial = 0;

        for (MealReservation m : meals) {
            int b = nvl(m.getBreakfast());
            int l = nvl(m.getLunch());
            int d = nvl(m.getDinner());
            totalNormal += (!m.isSpecialBreakfast() ? b : 0) + (!m.isSpecialLunch() ? l : 0)
                    + (!m.isSpecialDinner() ? d : 0);
            totalSpecial += (m.isSpecialBreakfast() ? b : 0) + (m.isSpecialLunch() ? l : 0)
                    + (m.isSpecialDinner() ? d : 0);
        }

        long nSub = (long) totalNormal * mealPrice;
        long nTax = Math.round(nSub * 0.1);
        long sSub = (long) totalSpecial * specialMealPrice;
        long sTax = Math.round(sSub * 0.1);

        // 일반식 row 34 (index 33)
        setLongNz(sheet, 33, 8, totalNormal); // I34: 식수
        setLong(sheet, 33, 11, mealPrice); // L34: 단가
        setLongNz(sheet, 33, 13, nSub); // N34
        setLongNz(sheet, 33, 16, nTax); // Q34
        setLongNz(sheet, 33, 19, nSub + nTax); // T34

        // 특식 row 35 (index 34) — 특식 없으면 formula 제거 (남으면 "- 0" 표시됨)
        if (totalSpecial == 0) {
            blankCell(sheet, 34, 8);  // I35
            blankCell(sheet, 34, 13); // N35
            blankCell(sheet, 34, 16); // Q35
            blankCell(sheet, 34, 19); // T35
        } else {
            setLongNz(sheet, 34, 8, totalSpecial); // I35
            setLong(sheet, 34, 11, specialMealPrice); // L35
            setLongNz(sheet, 34, 13, sSub); // N35
            setLongNz(sheet, 34, 16, sTax); // Q35
            setLongNz(sheet, 34, 19, sSub + sTax); // T35
        }

        // 식비 계 row 36 (index 35)
        setLongNz(sheet, 35, 13, nSub + sSub); // N36
        setLongNz(sheet, 35, 16, nTax + sTax); // Q36
        setLongNz(sheet, 35, 19, nSub + sSub + nTax + sTax); // T36

        return new long[] {nSub, nTax, sSub, sTax};
    }

    /** 시설 + 식비 계 row 채움 */
    private void fillGrandTotals(XSSFSheet sheet, long[] roomTotals, long[] classroomTotals,
            long[] mealTotals) {
        long facilitySubtotal = roomTotals[0] + classroomTotals[0];
        long facilityTax = roomTotals[1] + classroomTotals[1];
        long mealSubtotal = mealTotals[0] + mealTotals[2];
        long mealTax = mealTotals[1] + mealTotals[3];

        setLongNz(sheet, 37, 13, facilitySubtotal + mealSubtotal); // N38
        setLongNz(sheet, 37, 16, facilityTax + mealTax); // Q38
        setLongNz(sheet, 37, 19, facilitySubtotal + mealSubtotal + facilityTax + mealTax); // T38
    }

    /**
     * 식수 현황표 채움 (row 41~45)
     *
     * 항상 2칸 간격 (B, D, F, ... T) — 최대 10일 표시 10일 초과 시: 앞 9일만 표시 + T열에 "…" + 식수계는 전체 합산 식수계 열은 항상 col
     * 20 (U) 고정
     */
    private void fillMealTable(XSSFSheet sheet, List<MealReservation> meals) {
        if (meals.isEmpty())
            return;

        List<LocalDate> dates =
                meals.stream().map(MealReservation::getMealDate).sorted().distinct().toList();

        Map<LocalDate, MealReservation> byDate = meals.stream()
                .collect(Collectors.toMap(MealReservation::getMealDate, m -> m, (a, b) -> a));

        // 전체 합계 먼저 계산 (식수계는 항상 전체 날짜 합산)
        long[] rowTotals = {0, 0, 0};
        for (MealReservation m : meals) {
            rowTotals[0] += m.isSpecialBreakfast() ? 0 : nvl(m.getBreakfast());
            rowTotals[1] += m.isSpecialLunch() ? 0 : nvl(m.getLunch());
            rowTotals[2] += m.isSpecialDinner() ? 0 : nvl(m.getDinner());
        }

        boolean hasOverflow = dates.size() > 10;
        int visibleCount = hasOverflow ? 9 : dates.size();

        for (int i = 0; i < visibleCount; i++) {
            LocalDate d = dates.get(i);
            int col = 1 + (i * 2); // 2칸 간격: B=1, D=3, F=5, ...

            setStr(sheet, 40, col, d.getDayOfMonth() + "일");

            MealReservation m = byDate.get(d);
            if (m == null)
                continue;

            int b = m.isSpecialBreakfast() ? 0 : nvl(m.getBreakfast());
            int l = m.isSpecialLunch() ? 0 : nvl(m.getLunch());
            int dn = m.isSpecialDinner() ? 0 : nvl(m.getDinner());

            setLongOrDash(sheet, 41, col, b);
            setLongOrDash(sheet, 42, col, l);
            setLongOrDash(sheet, 43, col, dn);
            setLongOrDash(sheet, 44, col, b + l + dn);

            // 날짜 열 너비 자동 조정
            sheet.autoSizeColumn(col);
            if (sheet.getColumnWidth(col) < 1400) {
                sheet.setColumnWidth(col, 1400);
            }
        }

        // 날짜가 10개 초과 시 T열(col 19)에 "…" 표시
        if (hasOverflow) {
            setStr(sheet, 40, 19, "…");
            setStr(sheet, 41, 19, "…");
            setStr(sheet, 42, 19, "…");
            setStr(sheet, 43, 19, "…");
            setStr(sheet, 44, 19, "…");
        }

        // 식수계: 항상 col 20 (U열), 전체 날짜 합산
        setLong(sheet, 41, 20, rowTotals[0]);
        setLong(sheet, 42, 20, rowTotals[1]);
        setLong(sheet, 43, 20, rowTotals[2]);
        setLong(sheet, 44, 20, rowTotals[0] + rowTotals[1] + rowTotals[2]);
    }

    // ── 셀 접근 유틸 ──────────────────────────────────────────────────────────

    /**
     * 이미 있는 셀은 기존 스타일(날짜 형식, 테두리 등)을 유지하면서 값만 교체. 없는 셀은 새로 생성.
     */
    private Cell getOrCreate(XSSFSheet sheet, int rowIdx, int colIdx) {
        Row row = sheet.getRow(rowIdx);
        if (row == null)
            row = sheet.createRow(rowIdx);
        Cell cell = row.getCell(colIdx);
        if (cell == null)
            cell = row.createCell(colIdx);
        return cell;
    }

    private void setStr(XSSFSheet sheet, int row, int col, String value) {
        getOrCreate(sheet, row, col).setCellValue(value != null ? value : "");
    }

    private void setLong(XSSFSheet sheet, int row, int col, long value) {
        getOrCreate(sheet, row, col).setCellValue((double) value);
    }

    /** 0이면 쓰지 않음 — 수량·공급가액·세액·합계 칸에 사용 */
    private void setLongNz(XSSFSheet sheet, int row, int col, long value) {
        if (value == 0)
            return;
        getOrCreate(sheet, row, col).setCellValue((double) value);
    }

    /** 0이면 "-" 문자열, 아니면 숫자 — 식수 현황표에 사용 */
    private void setLongOrDash(XSSFSheet sheet, int row, int col, long value) {
        if (value == 0) setStr(sheet, row, col, "-");
        else setLong(sheet, row, col, value);
    }

    /** 셀을 blank로 만들기 (formula 포함 제거) */
    private void blankCell(XSSFSheet sheet, int rowIdx, int colIdx) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) return;
        Cell cell = row.getCell(colIdx);
        if (cell != null) cell.setBlank();
    }

    /** LocalDate → "2026년 03월 26일" 형식 문자열로 설정 */
    private void setDate(XSSFSheet sheet, int row, int col, LocalDate date) {
        if (date == null)
            return;
        String formatted = date.getYear() + "년 " + String.format("%02d", date.getMonthValue())
                + "월 " + String.format("%02d", date.getDayOfMonth()) + "일";
        getOrCreate(sheet, row, col).setCellValue(formatted);
    }

    private long toLong(String s) {
        try {
            return Long.parseLong(s.trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private int nvl(Integer v) {
        return v != null ? v : 0;
    }

    private String nvl(String v) {
        return v != null ? v : "";
    }
}
