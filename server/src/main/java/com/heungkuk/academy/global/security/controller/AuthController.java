package com.heungkuk.academy.global.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.heungkuk.academy.domain.account.dto.request.LoginRequest;
import com.heungkuk.academy.domain.account.dto.request.ReissueRequest;
import com.heungkuk.academy.domain.account.dto.request.SignupRequest;
import com.heungkuk.academy.domain.account.dto.response.LoginResponse;
import com.heungkuk.academy.domain.account.dto.response.SignupResponse;
import com.heungkuk.academy.domain.account.service.AccountService;
import com.heungkuk.academy.global.response.CommonResponse;
import com.heungkuk.academy.global.security.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;


@Tag(name = "인증", description = "로그인 / 회원가입 / 토큰 재발급 API")
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AccountService accountService;



    @Operation(summary = "로그인", description = "로그인을 위한 API")
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "401", description = "회원정보 불일치"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음")
        })
    @PostMapping("/login")
    public ResponseEntity<CommonResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.status(200).body(CommonResponse.success(authService.login(request)));
    }

    @Operation(summary = "회원가입", description = "회원가입을 위한 API")
            @ApiResponses({
                @ApiResponse(responseCode = "200", description = "회원가입 성공"),
            })
    @PostMapping("/signup")
    public ResponseEntity<CommonResponse<SignupResponse>> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.status(201).body(CommonResponse.success(accountService.signUp(request)));
    }


    @Operation(summary = "토큰 재발급", description = "Refresh Token으로 새로운 Access Token을 발급합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
        @ApiResponse(responseCode = "401", description = "리프레시 토큰이 유효하지 않거나 만료됨"),
        @ApiResponse(responseCode = "404", description = "존재하지 않는 계정")
    })
    @PostMapping("/reissue")
    public ResponseEntity<CommonResponse<LoginResponse>> reissue(@RequestBody ReissueRequest request) {
        return ResponseEntity.ok(CommonResponse.success(authService.reissue(request.getRefreshToken())));
    }


}
