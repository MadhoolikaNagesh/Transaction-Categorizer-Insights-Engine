package com.expense.categorizer.repository;

import com.expense.categorizer.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    
    Optional<Transaction> findByAccountIdAndExternalTransactionId(Long accountId, String externalTransactionId);

    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.status = 'REMOVED' WHERE t.account.bankConnection.userId = :userId AND t.account.bankConnection.institutionId = :institutionId")
    void softDeleteByUserIdAndInstitutionId(@Param("userId") Long userId, @Param("institutionId") String institutionId);

    @Modifying
    @Transactional
    @Query("UPDATE Transaction t SET t.status = 'REMOVED' WHERE t.account.bankConnection.userId = :userId")
    void softDeleteAllByUserId(@Param("userId") Long userId);
}
