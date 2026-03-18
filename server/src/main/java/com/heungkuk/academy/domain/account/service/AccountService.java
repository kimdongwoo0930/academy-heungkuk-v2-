package com.heungkuk.academy.domain.account.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.heungkuk.academy.domain.account.dto.request.SignupRequest;
import com.heungkuk.academy.domain.account.dto.response.AccountResponse;
import com.heungkuk.academy.domain.account.dto.response.SignupResponse;
import com.heungkuk.academy.domain.account.entity.Account;
import com.heungkuk.academy.domain.account.repository.AccountRepository;
import com.heungkuk.academy.global.exception.BusinessException;
import com.heungkuk.academy.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public SignupResponse signUp(SignupRequest request){
        // 1. userId 중복 확인 → 중복이면 ErrorCode.DUPLICATE_USER_ID 예외
        if(accountRepository.existsByUserId(request.getUserId())){
            throw new BusinessException(ErrorCode.DUPLICATE_USER_ID);
        }

        // 2. 비밀번호 BCrypt 암호화 (passwordEncoder.encode)
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Account 엔티티 생성 후 저장 (role: "ROLE_USER", state: false)
        Account account = Account.from(request, encodedPassword);
        accountRepository.save(account);

        return SignupResponse.of(account);
    }

    /**
     * 회원 정보 조회
     * @return List<AccountResponse>
     */
    public List<AccountResponse> getAccounts(){
        List<Account> accounts = accountRepository.findAll();
        List<AccountResponse> response = new ArrayList<>();
        for (Account a : accounts) {
            response.add(AccountResponse.of(a));
        }
        return response;
    }

    public void deleteAccount(Long id){
        Account account = accountRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        accountRepository.delete(account);
    }

    @Transactional
    public void updateRole(Long id, String role){
        Account account = accountRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        account.updateRole(role);
    }




}
