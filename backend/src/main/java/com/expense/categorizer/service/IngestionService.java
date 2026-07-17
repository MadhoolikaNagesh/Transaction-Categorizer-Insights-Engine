package com.expense.categorizer.service;

import com.expense.categorizer.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class IngestionService {

    @Autowired
    private TransactionService transactionService;

    public List<Transaction> ingestMockBankFeed(String bankName) {
        List<Transaction> mockData = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Regular Income (1st of current month)
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        mockData.add(Transaction.builder()
                .amount(120000.0)
                .currency("INR")
                .date(firstOfMonth)
                .description("Salary Direct Deposit - Antigravity Corp")
                .merchant("Antigravity Corp")
                .category("Income")
                .accountName("Checking Account")
                .bankName(bankName)
                .originalCategory("Payroll")
                .notes("Monthly salary credit")
                .build());

        // 2. Rent (2nd of current month)
        mockData.add(Transaction.builder()
                .amount(25000.0)
                .currency("INR")
                .date(firstOfMonth.plusDays(1))
                .description("Rent Payment - Orchid Apartments")
                .merchant("Orchid Apartments")
                .category("Rent")
                .accountName("Checking Account")
                .bankName(bankName)
                .originalCategory("Real Estate")
                .notes("House rent")
                .build());

        // 3. Regular Bills
        mockData.add(Transaction.builder()
                .amount(999.0)
                .currency("INR")
                .date(today.minusDays(12))
                .description("Airtel Fiber Broadband Bill")
                .merchant("Airtel")
                .category("Bills")
                .accountName("Checking Account")
                .bankName(bankName)
                .originalCategory("Utilities")
                .build());

        mockData.add(Transaction.builder()
                .amount(749.0)
                .currency("INR")
                .date(today.minusDays(10))
                .description("Jio Mobile Recharge")
                .merchant("Jio")
                .category("Bills")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Telecom")
                .build());

        // 4. Dining (Regular vs Spike)
        mockData.add(Transaction.builder()
                .amount(1200.0)
                .currency("INR")
                .date(today.minusDays(15))
                .description("Zomato * Royal Biryani")
                .merchant("Zomato")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Food Delivery")
                .build());

        mockData.add(Transaction.builder()
                .amount(850.0)
                .currency("INR")
                .date(today.minusDays(8))
                .description("Swiggy * Pizza Hut")
                .merchant("Swiggy")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Food Delivery")
                .build());

        // ANOMALY: Dining Spike (An unusually high charge of ₹8,500 on Zomato)
        mockData.add(Transaction.builder()
                .amount(8500.0)
                .currency("INR")
                .date(today.minusDays(5))
                .description("Zomato * Premium Seafood Grill")
                .merchant("Zomato")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Food Delivery")
                .notes("Weekend celebration dinner")
                .build());

        // 5. Coffee / Cafe (Regular vs Duplicates)
        mockData.add(Transaction.builder()
                .amount(380.0)
                .currency("INR")
                .date(today.minusDays(20))
                .description("Starbucks Coffee - MG Road")
                .merchant("Starbucks")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Cafe")
                .build());

        // ANOMALY: Duplicate Charge (Two identical Starbucks charges on the same day)
        LocalDate duplicateDate = today.minusDays(3);
        mockData.add(Transaction.builder()
                .amount(380.0)
                .currency("INR")
                .date(duplicateDate)
                .description("Starbucks Coffee - MG Road")
                .merchant("Starbucks")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Cafe")
                .notes("Authorized charge")
                .build());

        mockData.add(Transaction.builder()
                .amount(380.0)
                .currency("INR")
                .date(duplicateDate)
                .description("Starbucks Coffee - MG Road")
                .merchant("Starbucks")
                .category("Dining")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Cafe")
                .notes("System duplicated charge")
                .build());

        // 6. Groceries
        mockData.add(Transaction.builder()
                .amount(3200.0)
                .currency("INR")
                .date(today.minusDays(25))
                .description("Whole Foods Market - Bangalore")
                .merchant("Whole Foods")
                .category("Grocery")
                .accountName("Checking Account")
                .bankName(bankName)
                .originalCategory("Supermarket")
                .build());

        mockData.add(Transaction.builder()
                .amount(1800.0)
                .currency("INR")
                .date(today.minusDays(14))
                .description("Zepto Grocery Delivery")
                .merchant("Zepto")
                .category("Grocery")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Groceries")
                .build());

        // 7. Entertainment
        mockData.add(Transaction.builder()
                .amount(649.0)
                .currency("INR")
                .date(today.minusDays(18))
                .description("Netflix.com Subscription")
                .merchant("Netflix")
                .category("Entertainment")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Subscriptions")
                .build());

        mockData.add(Transaction.builder()
                .amount(179.0)
                .currency("INR")
                .date(today.minusDays(7))
                .description("Spotify India")
                .merchant("Spotify")
                .category("Entertainment")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Music Stream")
                .build());

        // 8. Shopping & ANOMALY: High Value (₹45,000 electronics charge)
        mockData.add(Transaction.builder()
                .amount(45000.0)
                .currency("INR")
                .date(today.minusDays(10))
                .description("Croma Electronics - Tablet Purchase")
                .merchant("Croma")
                .category("Shopping")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Electronics")
                .notes("Bought new iPad for work")
                .build());

        mockData.add(Transaction.builder()
                .amount(2100.0)
                .currency("INR")
                .date(today.minusDays(4))
                .description("Amazon.in - Apparel")
                .merchant("Amazon")
                .category("Shopping")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("E-Commerce")
                .build());

        // 9. Transportation
        mockData.add(Transaction.builder()
                .amount(450.0)
                .currency("INR")
                .date(today.minusDays(6))
                .description("Uber Trip - Office Commute")
                .merchant("Uber")
                .category("Transportation")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Rideshare")
                .build());

        mockData.add(Transaction.builder()
                .amount(320.0)
                .currency("INR")
                .date(today.minusDays(2))
                .description("Ola Cabs - Weekend Outing")
                .merchant("Ola")
                .category("Transportation")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Rideshare")
                .build());

        // 10. Medical
        mockData.add(Transaction.builder()
                .amount(1200.0)
                .currency("INR")
                .date(today.minusDays(11))
                .description("Apollo Pharmacy Medicines")
                .merchant("Apollo Pharmacy")
                .category("Medical")
                .accountName("Credit Card")
                .bankName(bankName)
                .originalCategory("Health")
                .build());

        // Save generated mock transactions
        return transactionService.saveTransactions(mockData);
    }
}
