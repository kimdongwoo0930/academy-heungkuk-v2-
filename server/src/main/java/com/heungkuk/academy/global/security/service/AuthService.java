package com.heungkuk.academy.global.security.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.heungkuk.academy.domain.account.dto.request.LoginRequest;
import com.heungkuk.academy.domain.account.dto.response.LoginResponse;
import com.heungkuk.academy.domain.account.entity.Account;
import com.heungkuk.academy.domain.account.repository.AccountRepository;
import com.heungkuk.academy.global.exception.BusinessException;
import com.heungkuk.academy.global.exception.ErrorCode;
import com.heungkuk.academy.global.security.jwt.JwtProvider;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {
    
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;



    /**
     * 로그인 함수
     * @param request
     * @return LoginResponse 
     */
    public LoginResponse login(LoginRequest request){
        // 1. userId로 Account 조회 → 없으면 예외
        Account account = accountRepository.findByUserId(request.getUserId()).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        // 2. 비밀번호 검증 (passwordEncoder.matches) → 틀리면 예외
        if(!passwordEncoder.matches(request.getPassword(), account.getPassword())){
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
        // 3. state 확인 → false면 미승인 예외
        if(!account.getState()){
            throw new BusinessException(ErrorCode.ACCOUNT_PENDING);
        }
        // 4. accessToken, refreshToken 생성
        String accessToken = jwtProvider.generateAccessToken(account.getUserId(), account.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(account.getUserId());
        // 5. refreshToken DB 저장
        account.updateRefreshToken(refreshToken);
        // 6. LoginResponse 반환
        return LoginResponse.of(accessToken, refreshToken);

    }

    /**
     * 토큰 재발급 함수
     * @param refreshToken
     * @return accessToken
     */
    public LoginResponse reissue(String refreshToken) {
        // 1. refreshToken 자체가 유효한지 검증 (만료됐거나 위조된 토큰 차단)
    //    → jwtProvider.validateToken(refreshToken) 이 false면 예외
        if(!jwtProvider.validateToken(refreshToken)){ 
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    // 2. 유효하면 토큰 안에서 userId 꺼내기
    //    → jwtProvider.getUserId(refreshToken)
        String userId = jwtProvider.getUserId(refreshToken);
    
    // 3. userId로 DB에서 Account 조회 → 없으면 예외
    //    → accountRepository.findByUserId(userId)
    Account account = accountRepository.findByUserId(userId).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
    
    // 4. DB에 저장된 refreshToken과 요청으로 온 refreshToken 비교
    //    → account.getRefreshToken().equals(refreshToken) 이 false면 예외
    //    (왜? 누군가 토큰을 훔쳤을 때 관리자가 DB에서 지우면 막을 수 있음)
    if(!account.getRefreshToken().equals(refreshToken)){
        throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
    }
    
    // 5. 새 accessToken 생성 (role도 필요하니까 account.getRole() 사용)
    //    → jwtProvider.generateAccessToken(userId, role)
    String accessToken = jwtProvider.generateAccessToken(account.getUserId(), account.getRole());
    
    // 6. LoginResponse 반환 (refreshToken은 기존 거 그대로
    return LoginResponse.of(accessToken, refreshToken);
    }
}


