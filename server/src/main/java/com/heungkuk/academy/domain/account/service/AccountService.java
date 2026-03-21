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

    // 관리자가 계정 생성 (state=true, 즉시 활성화)
    @Transactional
    public SignupResponse createAccount(SignupRequest request) {
        if (accountRepository.existsByUserId(request.getUserId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_USER_ID);
        }
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Account account = Account.fromAdmin(request, encodedPassword);
        accountRepository.save(account);
        return SignupResponse.of(account);
    }

    /**
     * 회원 정보 조회
     * 
     * @return List<AccountResponse>
     */
    public List<AccountResponse> getAccounts() {
        List<Account> accounts = accountRepository.findAll();
        List<AccountResponse> response = new ArrayList<>();
        for (Account a : accounts) {
            response.add(AccountResponse.of(a));
        }
        return response;
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        accountRepository.delete(account);
    }

    @Transactional
    public void updateRole(Long id, String role){
        Account account = accountRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        account.updateRole(role);
    }


    @Transactional
    public void updatePassword(Long id, String newPassword) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        account.updatePassword(passwordEncoder.encode(newPassword));
    }

    @Transactional
    public void updatePasswordByUserId(String userId, String newPassword) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        account.updatePassword(passwordEncoder.encode(newPassword));
    }




}
