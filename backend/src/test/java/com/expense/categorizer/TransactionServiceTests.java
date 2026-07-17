package com.expense.categorizer;

import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest
public class TransactionServiceTests {

    @Autowired
    private TransactionService transactionService;

    @Test
    public void testCategoryInference() {
        assertEquals("Dining", transactionService.inferCategory("Starbucks Coffee"));
        assertEquals("Transportation", transactionService.inferCategory("Uber Trip MG Road"));
        assertEquals("Grocery", transactionService.inferCategory("Whole Foods Market"));
        assertEquals("Bills", transactionService.inferCategory("Airtel Fiber Broadband Bill"));
        assertEquals("Entertainment", transactionService.inferCategory("Netflix.com Subscription"));
        assertEquals("Uncategorized", transactionService.inferCategory("Unknown Merchant xyz"));
    }

    @Test
    public void testDuplicateAnomalyDetection() {
        transactionService.clearAllTransactions(1L);

        LocalDate today = LocalDate.now();

        Transaction t1 = Transaction.builder()
                .amount(380.0)
                .date(today)
                .description("Starbucks MG Road")
                .category("Dining")
                .bankName("Chase")
                .userId(1L)
                .build();

        Transaction t2 = Transaction.builder()
                .amount(380.0)
                .date(today)
                .description("Starbucks MG Road")
                .category("Dining")
                .bankName("Chase")
                .userId(1L)
                .build();

        List<Transaction> saved = transactionService.saveTransactions(List.of(t1, t2));
        
        assertEquals(2, saved.size());
        assertEquals("DUPLICATE_SUSPECT", saved.get(0).getAnomalyStatus());
        assertEquals("DUPLICATE_SUSPECT", saved.get(1).getAnomalyStatus());
        
        transactionService.clearAllTransactions(1L);
    }
}
