package com.heungkuk.academy.domain.survey.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.heungkuk.academy.domain.survey.entity.SurveyToken;

public interface SurveyTokenRepository extends JpaRepository<SurveyToken, Long> {
    boolean existsByToken(String token);

    Optional<SurveyToken> findByToken(String token);

    Optional<SurveyToken> findByReservationId(String reservationId);
}
