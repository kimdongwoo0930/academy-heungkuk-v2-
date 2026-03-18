package com.heungkuk.academy.domain.account.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "토큰 재발급 요청")
@Getter
@NoArgsConstructor
public class ReissueRequest {

    @Schema(description = "Refresh Token", example = "eyJhbGciOiJIUzI1NiJ9...")
    @NotBlank(message = "refreshToken을 입력해주세요.")
    private String refreshToken;
}
