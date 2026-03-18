package com.heungkuk.academy.domain.account.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    @Schema(description = "access Token", example = "암호화된 토큰")
    private String accessToken;
    @Schema(description = "refresh Token", example = "암호화된 토큰")
    private String refreshToken;

    public static LoginResponse of(String accessToken, String refreshToken){
        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build();
    }
}
