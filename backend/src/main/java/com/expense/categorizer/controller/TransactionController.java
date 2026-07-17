package com.expense.categorizer.controller;

import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.service.IngestionService;
import com.expense.categorizer.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Allow React frontend to connect
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private IngestionService ingestionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean anomalyOnly,
            @RequestParam(required = false) String bankName
    ) {
        List<Transaction> list = transactionService.getTransactions(
                startDate, endDate, minAmount, maxAmount, category, search, anomalyOnly, bankName
        );
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        Transaction saved = transactionService.saveTransaction(transaction);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/ingest/mock")
    public ResponseEntity<List<Transaction>> ingestMock(
            @RequestParam(defaultValue = "Plaid Sandbox") String bankName
    ) {
        List<Transaction> ingested = ingestionService.ingestMockBankFeed(bankName);
        return ResponseEntity.ok(ingested);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearTransactions() {
        logger.info("TransactionController: Received request to clear all transactions");
        transactionService.clearAllTransactions();
        logger.info("TransactionController: Successfully cleared all transactions");
        return ResponseEntity.ok(Map.of("message", "All transactions cleared successfully"));
    }

    @DeleteMapping("/unlink")
    public ResponseEntity<Map<String, String>> unlinkBank(@RequestParam String bankName) {
        logger.info("TransactionController: Received request to unlink bank: {}", bankName);
        transactionService.unlinkBank(bankName);
        logger.info("TransactionController: Successfully unlinked bank: {}", bankName);
        return ResponseEntity.ok(Map.of("message", "Bank unlinked successfully: " + bankName));
    }

    @GetMapping("/linked-banks")
    public ResponseEntity<List<String>> getLinkedBanks() {
        logger.info("TransactionController: Received request to fetch linked banks");
        List<String> linkedBanks = transactionService.getLinkedBanks();
        logger.info("TransactionController: Fetched {} linked banks", linkedBanks.size());
        return ResponseEntity.ok(linkedBanks);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Double>> getStats() {
        return ResponseEntity.ok(transactionService.getCategoryStats());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Transaction>> getAnomalies() {
        List<Transaction> anomalies = transactionService.getTransactions(
                null, null, null, null, null, null, true, null
        );
        return ResponseEntity.ok(anomalies);
    }
}
