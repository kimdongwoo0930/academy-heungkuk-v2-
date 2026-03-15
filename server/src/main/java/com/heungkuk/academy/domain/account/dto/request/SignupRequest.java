package com.heungkuk.academy.domain.account.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "아이디를 입력해주세요. ")
    private String userId;

    @NotBlank(message = "비밀번호를 입력해주세요. ")
    private String password;

    @NotBlank(message = "이름을 입력해주세요.")
    private String username;
}
