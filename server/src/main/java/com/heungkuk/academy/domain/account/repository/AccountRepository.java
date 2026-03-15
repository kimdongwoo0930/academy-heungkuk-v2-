package com.heungkuk.academy.domain.account.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heungkuk.academy.domain.account.entity.Account;

public interface AccountRepository extends JpaRepository<Account,Long>{
    boolean existsByUserId(String userId);
    Optional<Account> findByUserId(String userId);
}  
