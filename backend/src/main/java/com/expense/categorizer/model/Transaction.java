package com.expense.categorizer.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String currency; // e.g., "INR", "USD"
    private LocalDate date;
    private String description;
    private String category; // e.g., "Dining", "Grocery", "Transportation", "Rent", "Bills", etc.
    private String merchant;
    private String anomalyStatus; // e.g., "NONE", "DUPLICATE_SUSPECT", "HIGH_SPIKE", "OUT_OF_PATTERN"
    private String anomalyDescription;
    private String notes;
    
    private String accountName; // e.g., "Checking", "Credit Card"
    private String bankName; // e.g., "Chase Sandbox", "Plaid Mock Bank"
    private String originalCategory; // Original raw category from bank feed
}
