package com.heungkuk.academy.domain.survey.service;


import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.heungkuk.academy.domain.survey.dto.request.SurveyRequest;
import com.heungkuk.academy.domain.survey.dto.response.SurveyResponse;
import com.heungkuk.academy.domain.survey.dto.response.SurveyTokenResponse;
import com.heungkuk.academy.domain.survey.entity.Survey;
import com.heungkuk.academy.domain.survey.entity.SurveyToken;
import com.heungkuk.academy.domain.survey.repository.SurveyRepository;
import com.heungkuk.academy.domain.survey.repository.SurveyTokenRepository;
import com.heungkuk.academy.global.exception.BusinessException;
import com.heungkuk.academy.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;


@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyTokenRepository surveyTokenRepository;


    // 설문 URL 생성 (관리자)
    // - SurveyToken 생성 (reservationId FK 연결, UUID 토큰, 만료일 설정)
    // - UUID 토큰 생성 후 SurveyToken 저장
    // - 생성된 토큰 URL 반환
    @Transactional
    public SurveyTokenResponse createUrl(String reservationId) {
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (surveyTokenRepository.existsByToken(token));

        SurveyToken surveyToken = SurveyToken.of(reservationId, token);
        surveyTokenRepository.save(surveyToken);

        // SurveyTokenResponse Dto 로 만들어서 보내주기
        return SurveyTokenResponse.from(surveyToken);
    }

    // 설문 응답 제출 (고객, 인증 불필요)
    // - token으로 SurveyToken 조회
    // - 사용 여부(isUsed) 검증
    // - Survey 저장 후 isUsed = true 처리
    @Transactional
    public void saveSurvey(String token, SurveyRequest surveyRequest) {
        SurveyToken surveyToken = surveyTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_TOKEN_NOT_FOUND));

        if (surveyToken.getIsUsed()) {
            throw new BusinessException(ErrorCode.SURVEY_ALREADY_SUBMITTED);
        }

        surveyRepository.save(Survey.of(surveyToken, surveyRequest.getAnswer()));
        surveyToken.updateIsUsed();
    }

    // 설문 결과 조회 (관리자)
    // - reservationId로 SurveyToken 조회
    // - 해당 토큰의 Survey 응답 목록 반환


    public List<SurveyResponse> getSurveys(String reservationId) {
        SurveyToken surveyToken = surveyTokenRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_TOKEN_NOT_FOUND));

        return surveyRepository.findBySurveyToken(surveyToken).stream().map(SurveyResponse::from)
                .toList();
    }


    public SurveyTokenResponse getToken(String reservationId) {
        SurveyToken surveyToken = surveyTokenRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SURVEY_TOKEN_NOT_FOUND));
        return SurveyTokenResponse.from(surveyToken);
    }


}
