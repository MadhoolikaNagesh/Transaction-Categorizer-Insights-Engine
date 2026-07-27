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
@Table(name = "bank_connections", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "plaid_item_id"})
}, indexes = {
        @Index(name = "idx_bank_conn_user_id", columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(name = "plaid_item_id", nullable = false)
    private String plaidItemId;

    @Column(name = "encrypted_access_token")
    private String encryptedAccessToken;

    @Column(name = "sync_cursor")
    private String syncCursor;

    @Column(name = "status")
    private String status; // ACTIVE, UNLINKED, ERROR

    @Column(name = "last_sync_started")
    private LocalDateTime lastSyncStarted;

    @Column(name = "last_sync_completed")
    private LocalDateTime lastSyncCompleted;

    @Column(name = "last_sync_status")
    private String lastSyncStatus;

    @Column(name = "last_error")
    private String lastError;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;
}
