package com.expense.categorizer.repository;

import com.expense.categorizer.model.BankConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankConnectionRepository extends JpaRepository<BankConnection, Long> {
    List<BankConnection> findByUserId(Long userId);
    Optional<BankConnection> findByUserIdAndPlaidItemId(Long userId, String plaidItemId);
}
