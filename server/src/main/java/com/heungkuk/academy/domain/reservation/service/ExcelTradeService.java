package com.heungkuk.academy.domain.reservation.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.heungkuk.academy.domain.reservation.entity.ClassroomReservation;
import com.heungkuk.academy.domain.reservation.entity.Reservation;
import com.heungkuk.academy.domain.reservation.entity.RoomReservation;
import com.heungkuk.academy.domain.reservation.repository.ClassroomReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.ReservationRepository;
import com.heungkuk.academy.domain.reservation.repository.RoomReservationRepository;
import com.heungkuk.academy.domain.setting.entity.AppSetting;
import com.heungkuk.academy.domain.setting.repository.AppSettingRepository;
import com.heungkuk.academy.global.exception.BusinessException;
import com.heungkuk.academy.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 거래명세서 생성 서비스
 *
 * 템플릿: classpath:/templates/trade_template.xlsx (빈문서 시트)
 *
 * 셀 위치 (0-indexed):
 *  C3  (row2, col2)  발행일
 *  B4  (row3, col1)  업체명
 *  B6  (row5, col1)  총금액 "(₩xxx-)" 형식
 *  Z4  (row3, col25) 성명 (담당자)
 *  G7  (row6, col6)  교육명칭
 *  G8  (row7, col6)  사용기간 시작
 *  T8  (row7, col19) 사용기간 종료
 *
 *  품목 행 (ITEM_START_ROW ~ 계행-1):
 *    D(col3) 품목명 / K(col10) 규격 / N(col13) 수량 / Q(col16) 단가
 *    T(col19) 공급가액 / Z(col25) 세액
 *
 *  계 행: T(col19) 공급가액 합계 / Z(col25) 세액 합계
 *  합계 행 (계+1): T(col19) 총합계(공급가액+세액)
 *
 *  담당자 행 (row30):
 *    E(col4) 담당자명 / L(col11) 연락처 / S(col18) 팩스 / Z(col25) 이메일
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExcelTradeService {

    private final ReservationRepository reservationRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final ClassroomReservationRepository classroomReservationRepository;
    private final AppSettingRepository appSettingRepository;

    // ── 숙박 호실 → 타입 매핑 ──────────────────────────────────────────────────
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

    // ── 강의실 호실 → 카테고리 매핑 ────────────────────────────────────────────
    private static final Map<String, String> CLASSROOM_CATEGORY = Map.ofEntries(
            Map.entry("105", "대형(120인)"), Map.entry("201", "중형(70인)"), Map.entry("203", "중형(50인)"),
            Map.entry("204", "중형(50인)"), Map.entry("101", "소형(30인)"), Map.entry("103", "소형(30인)"),
            Map.entry("202", "소형(30인)"), Map.entry("102", "소형(20인)"), Map.entry("106", "분임실(12인)"),
            Map.entry("107", "분임실(12인)"), Map.entry("205", "분임실(12인)"),
            Map.entry("206", "분임실(12인)"), Map.entry("A", "다목적실"), Map.entry("B", "다목적실"));

    // ── 카테고리 → 거래명세서 품목명 ──────────────────────────────────────────
    private static final Map<String, String> CATEGORY_LABEL = Map.of(
            "대형(120인)", "시설사용료(대형)_120인",
            "중형(70인)", "시설사용료(중형)_70인",
            "중형(50인)", "시설사용료(중형)_50인",
            "소형(30인)", "시설사용료(소형)_30인",
            "소형(20인)", "시설사용료(소형)_20인",
            "분임실(12인)", "시설사용료(분임토의실)",
            "다목적실", "다목적실");

    // ── 항목 출력 순서 ─────────────────────────────────────────────────────────
    private static final List<String> ROOM_ORDER = List.of("4인실", "2인실", "1인실");
    private static final List<String> CLASSROOM_ORDER = List.of(
            "대형(120인)", "중형(70인)", "중형(50인)", "소형(30인)", "소형(20인)", "분임실(12인)", "다목적실");

    private static final int ITEM_START_ROW = 9;  // 0-based (Excel row 10)
    private static final int TEMPLATE_ITEM_ROWS = 15; // 템플릿 항목 행 수 (rows 9~23)

    // ── 내부 레코드 ────────────────────────────────────────────────────────────
    private record TradeItem(String name, String spec, long qty, long unitPrice, long supply, long tax) {}

    // ── 공개 API ──────────────────────────────────────────────────────────────

    public byte[] generateTrade(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_NOT_FOUND));

        List<RoomReservation> rooms = roomReservationRepository.findByReservation(res);
        List<ClassroomReservation> classrooms = classroomReservationRepository.findByReservation(res);

        Map<String, String> settings = appSettingRepository.findAll().stream()
                .collect(Collectors.toMap(AppSetting::getSettingKey, AppSetting::getSettingValue));

        long roomPrice = toLong(settings.getOrDefault("price.room", "85000"));

        try (InputStream is = getClass().getResourceAsStream("/templates/trade_template.xlsx");
                XSSFWorkbook wb = new XSSFWorkbook(is)) {

            XSSFSheet sheet = wb.getSheetAt(0);

            List<TradeItem> items = buildItems(rooms, classrooms, settings, roomPrice);

            ensureItemRows(sheet, items.size());

            int kaeRow = findKaeRow(sheet);
            fillHeader(sheet, res, settings);
            long[] totals = fillItems(sheet, items, kaeRow);
            fillTotals(sheet, totals, kaeRow);
            fillContact(sheet, settings, kaeRow);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("거래명세서 생성 실패 reservationId={}", reservationId, e);
            throw new RuntimeException("거래명세서 생성 중 오류가 발생했습니다.");
        }
    }

    // ── 항목 목록 구성 ─────────────────────────────────────────────────────────

    private List<TradeItem> buildItems(List<RoomReservation> rooms,
            List<ClassroomReservation> classrooms, Map<String, String> settings, long roomPrice) {

        List<TradeItem> items = new ArrayList<>();

        // 숙박: 타입별 집계
        Map<String, List<RoomReservation>> byType = rooms.stream()
                .collect(Collectors.groupingBy(
                        r -> ROOM_TYPE.getOrDefault(r.getRoomNumber(), "4인실")));

        for (String type : ROOM_ORDER) {
            List<RoomReservation> typeRooms = byType.getOrDefault(type, List.of());
            if (typeRooms.isEmpty()) continue;

            long nights = typeRooms.stream().map(RoomReservation::getReservedDate).distinct().count();
            long count = typeRooms.stream().map(RoomReservation::getRoomNumber).distinct().count();
            long supply = nights * count * roomPrice;
            long tax = Math.round(supply * 0.1);

            items.add(new TradeItem(
                    "숙박비(" + type + ")",
                    nights + "박",
                    count,
                    roomPrice,
                    supply,
                    tax));
        }

        // 강의실: 카테고리별 집계
        Map<String, List<ClassroomReservation>> byCategory = classrooms.stream()
                .filter(c -> CLASSROOM_CATEGORY.containsKey(c.getClassroom()))
                .collect(Collectors.groupingBy(c -> CLASSROOM_CATEGORY.get(c.getClassroom())));

        for (String cat : CLASSROOM_ORDER) {
            List<ClassroomReservation> catList = byCategory.getOrDefault(cat, List.of());
            if (catList.isEmpty()) continue;

            long days = catList.stream().map(ClassroomReservation::getReservedDate).distinct().count();
            long count = catList.stream().map(ClassroomReservation::getClassroom).distinct().count();
            long price = toLong(settings.getOrDefault("price.classroom." + cat, "0"));
            long supply = days * count * price;
            long tax = Math.round(supply * 0.1);

            items.add(new TradeItem(
                    CATEGORY_LABEL.get(cat),
                    days + "일",
                    count,
                    price,
                    supply,
                    tax));
        }

        return items;
    }

    // ── 행 확보 (항목 수 > 템플릿 행 수일 때 shiftRows) + 모든 항목 행 unhide ──

    private void ensureItemRows(XSSFSheet sheet, int needed) {
        // 템플릿의 숨겨진 항목 행을 모두 unhide (나중에 빈 행은 다시 숨김)
        for (int r = ITEM_START_ROW; r < ITEM_START_ROW + TEMPLATE_ITEM_ROWS; r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            row.setZeroHeight(false);
        }

        if (needed <= TEMPLATE_ITEM_ROWS) return;

        int extra = needed - TEMPLATE_ITEM_ROWS;
        int shiftFrom = ITEM_START_ROW + TEMPLATE_ITEM_ROWS;
        int lastRow = sheet.getLastRowNum();
        sheet.shiftRows(shiftFrom, lastRow, extra);

        // 스타일 복사 (첫 항목 행 기준)
        Row templateRow = sheet.getRow(ITEM_START_ROW);
        for (int i = 0; i < extra; i++) {
            Row newRow = sheet.createRow(shiftFrom + i);
            if (templateRow != null) {
                newRow.setHeight(templateRow.getHeight());
                for (int col = 1; col <= 31; col++) {
                    Cell src = templateRow.getCell(col);
                    Cell dst = newRow.createCell(col);
                    if (src != null) dst.setCellStyle(src.getCellStyle());
                }
            }
        }
    }

    // ── 헤더 채우기 ────────────────────────────────────────────────────────────

    private void fillHeader(XSSFSheet sheet, Reservation res, Map<String, String> settings) {
        setStr(sheet, 2, 2, formatDate(LocalDate.now()));       // C3: 발행일
        setStr(sheet, 3, 1, res.getOrganization());              // B4: 업체명
        setStr(sheet, 3, 25, settings.getOrDefault("contact.representative", "")); // Z4: 성명(대표이사)
        setStr(sheet, 6, 6, nvl(res.getPurpose()));              // G7: 교육명칭
        setStr(sheet, 7, 6, formatDate(res.getStartDate()));     // G8: 사용기간 시작
        setStr(sheet, 7, 19, formatDate(res.getEndDate()));      // T8: 사용기간 종료
    }

    // ── 항목 행 채우기 ─────────────────────────────────────────────────────────

    private long[] fillItems(XSSFSheet sheet, List<TradeItem> items, int kaeRow) {
        // 기존 항목 행 초기화 (계 행 직전까지)
        for (int r = ITEM_START_ROW; r < kaeRow; r++) {
            clearItemRow(sheet, r);
        }

        long totalSupply = 0, totalTax = 0;

        for (int i = 0; i < items.size(); i++) {
            TradeItem item = items.get(i);
            int rowIdx = ITEM_START_ROW + i;

            setStr(sheet, rowIdx, 3, item.name());       // D: 품목
            setStr(sheet, rowIdx, 10, item.spec());      // K: 규격 ("1박", "2일" 등)
            setLongNz(sheet, rowIdx, 13, item.qty());    // N: 수량
            setLongNz(sheet, rowIdx, 16, item.unitPrice()); // Q: 단가
            setLongNz(sheet, rowIdx, 19, item.supply()); // T: 공급가액
            setLongNz(sheet, rowIdx, 25, item.tax());    // Z: 세액

            totalSupply += item.supply();
            totalTax += item.tax();
        }

        // 데이터 없는 나머지 항목 행 숨김
        for (int r = ITEM_START_ROW + items.size(); r < kaeRow; r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            row.setZeroHeight(true);
        }

        return new long[]{totalSupply, totalTax};
    }

    // ── 합계 채우기 ────────────────────────────────────────────────────────────

    private void fillTotals(XSSFSheet sheet, long[] totals, int kaeRow) {
        long supply = totals[0];
        long tax = totals[1];
        long grand = supply + tax;

        setLongNz(sheet, kaeRow, 19, supply);      // 계 행 공급가액
        setLongNz(sheet, kaeRow, 25, tax);         // 계 행 세액
        setLongNz(sheet, kaeRow + 1, 19, grand);   // 합계 행
        // 할인(kaeRow+2), 선금(kaeRow+3) 데이터 없음 → 잔금 = 합계
        setLongNz(sheet, kaeRow + 4, 16, grand);   // 잔금 행 Q열

        // B6: "(₩xxx-)" 형식 총금액 (공급가액+세액)
        String formatted = "(₩" + NumberFormat.getNumberInstance(Locale.KOREA).format(grand) + "-)";
        setStr(sheet, 5, 1, formatted);
    }

    // ── 담당자 정보 채우기 ─────────────────────────────────────────────────────
    // 계 행 기준 오프셋으로 위치 계산 (shiftRows 대응)

    private void fillContact(XSSFSheet sheet, Map<String, String> settings, int kaeRow) {
        // 계(kaeRow) → 합계(+1) → 할인(+2) → 선금(+3) → 잔금(+4) → 결제방식(+5) → 담당자(+6)
        int contactRow = kaeRow + 6;

        setStr(sheet, contactRow, 4, settings.getOrDefault("contact.manager", ""));  // E: 담당자명
        setStr(sheet, contactRow, 11, settings.getOrDefault("contact.phone", ""));   // L: 연락처
        setStr(sheet, contactRow, 18, settings.getOrDefault("contact.fax", ""));     // S: 팩스
        setStr(sheet, contactRow, 25, settings.getOrDefault("contact.email", ""));   // Z: 이메일
    }

    // ── 계 행 동적 탐색 ────────────────────────────────────────────────────────

    private int findKaeRow(XSSFSheet sheet) {
        for (int r = ITEM_START_ROW; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            Cell cell = row.getCell(1); // B열
            if (cell != null && CellType.STRING.equals(cell.getCellType())
                    && "계".equals(cell.getStringCellValue().trim())) {
                return r;
            }
        }
        return ITEM_START_ROW + TEMPLATE_ITEM_ROWS; // fallback
    }

    // ── 행 초기화 ──────────────────────────────────────────────────────────────

    private void clearItemRow(XSSFSheet sheet, int rowIdx) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) return;
        for (int col : new int[]{3, 10, 13, 16, 19, 25}) {
            Cell cell = row.getCell(col);
            if (cell != null) cell.setBlank();
        }
    }

    // ── 셀 접근 유틸 ──────────────────────────────────────────────────────────

    private Cell getOrCreate(XSSFSheet sheet, int rowIdx, int colIdx) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) row = sheet.createRow(rowIdx);
        Cell cell = row.getCell(colIdx);
        if (cell == null) return row.createCell(colIdx);
        // 수식 셀은 스타일을 보존하며 일반 셀로 교체 (수식이 남아있으면 값이 덮어써지지 않음)
        if (CellType.FORMULA.equals(cell.getCellType())) {
            org.apache.poi.ss.usermodel.CellStyle style = cell.getCellStyle();
            row.removeCell(cell);
            cell = row.createCell(colIdx);
            cell.setCellStyle(style);
        }
        return cell;
    }

    private void setStr(XSSFSheet sheet, int row, int col, String value) {
        getOrCreate(sheet, row, col).setCellValue(value != null ? value : "");
    }

    private void setLongNz(XSSFSheet sheet, int row, int col, long value) {
        if (value == 0) return;
        getOrCreate(sheet, row, col).setCellValue((double) value);
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "";
        return date.getYear() + "년 "
                + String.format("%02d", date.getMonthValue()) + "월 "
                + String.format("%02d", date.getDayOfMonth()) + "일";
    }

    private long toLong(String s) {
        try { return Long.parseLong(s.trim()); }
        catch (NumberFormatException e) { return 0L; }
    }

    private String nvl(String v) { return v != null ? v : ""; }
}
