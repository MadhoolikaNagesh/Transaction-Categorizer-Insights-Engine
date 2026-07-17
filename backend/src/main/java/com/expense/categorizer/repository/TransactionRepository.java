package com.expense.categorizer.repository;

import com.expense.categorizer.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    
    List<Transaction> findByUserIdAndAnomalyStatusNot(Long userId, String anomalyStatus);
    
    List<Transaction> findByUserIdAndCategory(Long userId, String category);

    @Modifying
    @Transactional
    @Query("DELETE FROM Transaction t WHERE t.userId = :userId AND t.bankName = :bankName")
    void deleteByUserIdAndBankName(@Param("userId") Long userId, @Param("bankName") String bankName);

    @Query("SELECT DISTINCT t.bankName FROM Transaction t WHERE t.userId = :userId AND t.bankName IS NOT NULL AND t.bankName <> ''")
    List<String> findDistinctBankNamesByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Transaction t WHERE t.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
