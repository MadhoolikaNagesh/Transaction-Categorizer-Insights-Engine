package com.expense.categorizer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "external_transaction_id"})
}, indexes = {
        @Index(name = "idx_transaction_account_id", columnList = "account_id"),
        @Index(name = "idx_transaction_date", columnList = "date"),
        @Index(name = "idx_transaction_category", columnList = "category")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_transaction_id", nullable = false)
    private String externalTransactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    private Double amount;
    private String currency; // e.g., "INR", "USD"
    private LocalDate date;
    private String description;
    private String category; // e.g., "Dining", "Grocery", "Transportation", "Rent", "Bills", etc.
    
    @Column(name = "merchant_name")
    private String merchantName;
    
    @Column(name = "pending")
    private Boolean pending;
    
    private String anomalyStatus; // e.g., "NONE", "DUPLICATE_SUSPECT", "HIGH_SPIKE", "OUT_OF_PATTERN"
    private String anomalyDescription;
    private String notes;
    
    private String type; // Either "CREDIT" or "DEBIT"

    @Column(name = "status")
    private String status; // ACTIVE, REMOVED, ARCHIVED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
