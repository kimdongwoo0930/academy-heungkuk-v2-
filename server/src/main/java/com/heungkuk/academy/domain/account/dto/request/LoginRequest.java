package com.heungkuk.academy.domain.account.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "아이디를 입력해주세요. ")
    private String userId;

    @NotBlank(message = "비밀번호를 입력해주세요. ")
    private String password;

}
