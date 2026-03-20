package com.heungkuk.academy.domain.survey.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.heungkuk.academy.domain.survey.entity.Survey;
import com.heungkuk.academy.domain.survey.entity.SurveyToken;


public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findBySurveyToken(SurveyToken surveyToken);

}
