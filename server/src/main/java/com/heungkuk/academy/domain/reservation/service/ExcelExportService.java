package com.heungkuk.academy.domain.reservation.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final ReservationRepository reservationRepository;
    private final RoomReservationRepository roomReservationRepository;
    private final ClassroomReservationRepository classroomReservationRepository;
    private final MealReservationRepository mealReservationRepository;

    /**
     * 모든 예약 데이터를 4개 시트 xlsx로 변환하여 byte[] 로 반환
     *
     * 시트 구성:
     *   1. 예약정보        — reservation 테이블
     *   2. 숙박예약        — room_reservation 테이블
     *   3. 강의실예약      — classroom_reservation 테이블
     *   4. 식수예약        — meal_reservation 테이블
     */
    @Transactional(readOnly = true)
    public byte[] exportAll() {
        List<Reservation> reservations = reservationRepository.findAll();
        List<RoomReservation> rooms = roomReservationRepository.findAll();
        List<ClassroomReservation> classrooms = classroomReservationRepository.findAll();
        List<MealReservation> meals = mealReservationRepository.findAll();

        // XSSFWorkbook = 엑셀 파일 한 개 (메모리에 생성)
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            CellStyle headerStyle = makeHeaderStyle(wb);

            writeReservationSheet(wb, headerStyle, reservations);
            writeRoomSheet(wb, headerStyle, rooms);
            writeClassroomSheet(wb, headerStyle, classrooms);
            writeMealSheet(wb, headerStyle, meals);

            // 완성된 워크북을 byte[]로 변환 (이 byte[]를 HTTP 응답으로 내려줌)
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Excel export 실패", e);
            throw new RuntimeException("엑셀 생성 중 오류가 발생했습니다.");
        }
    }

    // ── Sheet 1: 예약 기본정보 ────────────────────────────────────────────────

    private void writeReservationSheet(XSSFWorkbook wb, CellStyle headerStyle,
            List<Reservation> list) {
        XSSFSheet sheet = wb.createSheet("예약정보");

        // 헤더 행 (0번 행)
        String[] headers = {"예약코드", "단체명", "목적", "인원수", "담당자", "연락처1", "연락처2",
                "이메일", "시작일", "종료일", "컬러코드", "상태", "주소", "현장담당자", "현장연락처", "메모"};
        writeHeader(sheet, headerStyle, headers);

        // 데이터 행 (1번 행부터)
        int rowNum = 1;
        for (Reservation r : list) {
            Row row = sheet.createRow(rowNum++);
            int col = 0;
            setCell(row, col++, r.getReservationCode());
            setCell(row, col++, r.getOrganization());
            setCell(row, col++, r.getPurpose());
            setCell(row, col++, r.getPeople() != null ? r.getPeople() : 0);
            setCell(row, col++, r.getCustomer());
            setCell(row, col++, r.getCustomerPhone());
            setCell(row, col++, r.getCustomerPhone2());
            setCell(row, col++, r.getCustomerEmail());
            setCell(row, col++, r.getStartDate());   // LocalDate → 문자열로 저장
            setCell(row, col++, r.getEndDate());
            setCell(row, col++, r.getColorCode());
            setCell(row, col++, r.getStatus());
            setCell(row, col++, r.getCompanyAddress());
            setCell(row, col++, r.getSiteManager());
            setCell(row, col++, r.getSiteManagerPhone());
            setCell(row, col++, r.getMemo());
        }

        autoSizeColumns(sheet, headers.length);
    }

    // ── Sheet 2: 숙박 예약 ────────────────────────────────────────────────────

    private void writeRoomSheet(XSSFWorkbook wb, CellStyle headerStyle,
            List<RoomReservation> list) {
        XSSFSheet sheet = wb.createSheet("숙박예약");

        String[] headers = {"예약코드", "호실", "날짜"};
        writeHeader(sheet, headerStyle, headers);

        int rowNum = 1;
        for (RoomReservation r : list) {
            Row row = sheet.createRow(rowNum++);
            setCell(row, 0, r.getReservation().getReservationCode());
            setCell(row, 1, r.getRoomNumber());
            setCell(row, 2, r.getReservedDate());
        }

        autoSizeColumns(sheet, headers.length);
    }

    // ── Sheet 3: 강의실 예약 ──────────────────────────────────────────────────

    private void writeClassroomSheet(XSSFWorkbook wb, CellStyle headerStyle,
            List<ClassroomReservation> list) {
        XSSFSheet sheet = wb.createSheet("강의실예약");

        String[] headers = {"예약코드", "강의실", "날짜"};
        writeHeader(sheet, headerStyle, headers);

        int rowNum = 1;
        for (ClassroomReservation c : list) {
            Row row = sheet.createRow(rowNum++);
            setCell(row, 0, c.getReservation().getReservationCode());
            setCell(row, 1, c.getClassroom());
            setCell(row, 2, c.getReservedDate());
        }

        autoSizeColumns(sheet, headers.length);
    }

    // ── Sheet 4: 식수 예약 ────────────────────────────────────────────────────

    private void writeMealSheet(XSSFWorkbook wb, CellStyle headerStyle,
            List<MealReservation> list) {
        XSSFSheet sheet = wb.createSheet("식수예약");

        String[] headers = {"예약코드", "날짜", "조식", "중식", "석식", "특별조식", "특별중식", "특별석식"};
        writeHeader(sheet, headerStyle, headers);

        int rowNum = 1;
        for (MealReservation m : list) {
            Row row = sheet.createRow(rowNum++);
            int col = 0;
            setCell(row, col++, m.getReservation().getReservationCode());
            setCell(row, col++, m.getMealDate());
            setCell(row, col++, m.getBreakfast() != null ? m.getBreakfast() : 0);
            setCell(row, col++, m.getLunch() != null ? m.getLunch() : 0);
            setCell(row, col++, m.getDinner() != null ? m.getDinner() : 0);
            setCell(row, col++, m.isSpecialBreakfast() ? "Y" : "N");
            setCell(row, col++, m.isSpecialLunch() ? "Y" : "N");
            setCell(row, col++, m.isSpecialDinner() ? "Y" : "N");
        }

        autoSizeColumns(sheet, headers.length);
    }

    // ── 공통 유틸 ─────────────────────────────────────────────────────────────

    /** 헤더 행 작성 (0번 행, 파란 배경 + 볼드) */
    private void writeHeader(XSSFSheet sheet, CellStyle style, String[] headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    /** 헤더 스타일 생성 — 파란 배경, 흰색 볼드 폰트, 테두리 */
    private CellStyle makeHeaderStyle(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);

        return style;
    }

    /** 셀에 문자열 값 설정 (null 안전) */
    private void setCell(Row row, int col, String value) {
        row.createCell(col).setCellValue(value != null ? value : "");
    }

    /** 셀에 정수 값 설정 */
    private void setCell(Row row, int col, int value) {
        row.createCell(col).setCellValue(value);
    }

    /** 셀에 LocalDate → "yyyy-MM-dd" 문자열로 설정 */
    private void setCell(Row row, int col, LocalDate date) {
        row.createCell(col).setCellValue(date != null ? date.toString() : "");
    }

    /** 컬럼 너비 자동 조정 */
    private void autoSizeColumns(XSSFSheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
