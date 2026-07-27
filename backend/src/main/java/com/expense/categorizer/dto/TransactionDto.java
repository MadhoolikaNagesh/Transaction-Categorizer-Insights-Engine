package com.expense.categorizer.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransactionDto {
    private Long id;
    private String externalTransactionId;
    private AccountDto account;
    private Double amount;
    private String currency;
    private LocalDate date;
    private String description;
    private String category;
    private String merchantName;
    private Boolean pending;
    private String anomalyStatus;
    private String anomalyDescription;
    private String notes;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class AccountDto {
        private Long id;
        private BankConnectionDto bankConnection;
        private String externalAccountId;
        private String name;
        private String officialName;
        private String mask;
        private String type;
        private String subtype;
        private String currency;
        private Double currentBalance;
        private Double availableBalance;
        private LocalDateTime balanceLastUpdated;
        private String status;
    }

    @Data
    public static class BankConnectionDto {
        private Long id;
        private Long userId;
        private String institutionId;
        private String institutionName;
        private String plaidItemId;
        private String status;
        private LocalDateTime lastSyncStarted;
        private LocalDateTime lastSyncCompleted;
        private String lastSyncStatus;
        private String lastError;
        private LocalDateTime createdAt;
    }
}
