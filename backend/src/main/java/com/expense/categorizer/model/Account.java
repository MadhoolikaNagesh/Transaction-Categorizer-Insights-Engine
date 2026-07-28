package com.expense.categorizer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "accounts", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"bank_connection_id", "external_account_id"})
}, indexes = {
        @Index(name = "idx_account_bank_conn_id", columnList = "bank_connection_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_connection_id", nullable = false)
    private BankConnection bankConnection;

    @Column(name = "external_account_id", nullable = false)
    private String externalAccountId;

    @Column(name = "name")
    private String name;

    @Column(name = "official_name")
    private String officialName;

    @Column(name = "mask")
    private String mask;

    @Column(name = "type")
    private String type; // depository, credit, etc.

    @Column(name = "subtype")
    private String subtype; // checking, savings, credit card, etc.

    @Column(name = "currency")
    private String currency;

    @Column(name = "current_balance")
    private Double currentBalance;

    @Column(name = "available_balance")
    private Double availableBalance;

    @Column(name = "balance_last_updated")
    private LocalDateTime balanceLastUpdated;

    @Column(name = "status")
    private String status; // ACTIVE, DISABLED, CLOSED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
