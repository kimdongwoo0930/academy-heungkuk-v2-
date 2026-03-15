package com.heungkuk.academy.domain.account.dto.response;

import com.heungkuk.academy.domain.account.entity.Account;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupResponse {

    
    private Long id;
    private String userId;
    private String username;
    private String role;
    private boolean state;


    public static SignupResponse of(Account account) {
        return SignupResponse.builder()
            .id(account.getId())
            .userId(account.getUserId())
            .username(account.getUsername())
            .role(account.getRole())
            .state(account.getState())
            .build();
}

}
