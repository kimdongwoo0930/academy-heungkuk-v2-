package com.heungkuk.academy.domain.account.dto.request;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "회원가입 요청")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {

    @Schema(description = "로그인 아이디", example = "admin01")
    @NotBlank(message = "아이디를 입력해주세요. ")
    private String userId;

    @Schema(description = "비밀번호", example = "password123!")
    @NotBlank(message = "비밀번호를 입력해주세요. ")
    private String password;

    @Schema(description = "직원 이름", example = "홍길동")
    @NotBlank(message = "이름을 입력해주세요.")
    private String username;
}
