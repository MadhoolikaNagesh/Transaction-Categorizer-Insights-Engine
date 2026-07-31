package com.expense.categorizer.controller;

import com.expense.categorizer.dto.LinkBankResponse;
import com.expense.categorizer.dto.SyncRequest;
import com.expense.categorizer.dto.SyncSummaryResponse;
import com.expense.categorizer.dto.TransactionDto;
import com.expense.categorizer.model.Account;
import com.expense.categorizer.model.BankConnection;
import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.repository.AccountRepository;
import com.expense.categorizer.repository.BankConnectionRepository;
import com.expense.categorizer.service.PlaidService;
import com.expense.categorizer.service.TransactionService;
import com.expense.categorizer.service.TransactionSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow React/Angular frontend to connect
public class SyncController {

    private static final Logger logger = LoggerFactory.getLogger(SyncController.class);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionSyncService transactionSyncService;

    @Autowired
    private PlaidService plaidService;

    @Autowired
    private BankConnectionRepository bankConnectionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean anomalyOnly,
            @RequestParam(required = false) String bankName // mapped to institutionName in specification
    ) {
        List<Transaction> list = transactionService.getTransactions(
                userId, startDate, endDate, minAmount, maxAmount, category, search, anomalyOnly, bankName
        );
        List<TransactionDto> dtos = list.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/transactions")
    public ResponseEntity<TransactionDto> createTransaction(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String bankName,
            @RequestBody Transaction transaction
    ) {
        if (transaction.getAccount() == null) {
            List<BankConnection> connections = bankConnectionRepository.findByUserId(userId).stream()
                    .filter(bc -> "ACTIVE".equals(bc.getStatus()))
                    .collect(Collectors.toList());

            BankConnection connection = null;
            if (bankName != null && !bankName.trim().isEmpty()) {
                connection = connections.stream()
                        .filter(bc -> bankName.equalsIgnoreCase(bc.getInstitutionName()))
                        .findFirst()
                        .orElse(null);
            }

            if (connection == null && !connections.isEmpty()) {
                connection = connections.get(0);
            }

            if (connection == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active bank connections found. Please link a bank feed first.");
            }

            List<Account> accounts = accountRepository.findByBankConnectionId(connection.getId());
            if (accounts.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No accounts found for bank connection: " + connection.getInstitutionName());
            }

            // Try to assign the first depository/checking account, else default to the first available account
            Account selectedAccount = accounts.get(0);
            for (Account acc : accounts) {
                if ("depository".equalsIgnoreCase(acc.getType())) {
                    selectedAccount = acc;
                    break;
                }
            }
            transaction.setAccount(selectedAccount);
        }

        if (transaction.getExternalTransactionId() == null) {
            transaction.setExternalTransactionId("manual_" + UUID.randomUUID().toString());
        }

        if (transaction.getStatus() == null) {
            transaction.setStatus("ACTIVE");
        }

        Transaction saved = transactionService.saveTransaction(transaction);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @PostMapping("/plaid/link")
    public ResponseEntity<LinkBankResponse> linkBankMock(@RequestParam String bankName) {
        return ResponseEntity.ok(plaidService.mockLinkBank(bankName));
    }

    @PostMapping("/transactions/sync")
    public ResponseEntity<SyncSummaryResponse> syncTransactions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody SyncRequest syncRequest
    ) {
        SyncSummaryResponse response = transactionSyncService.syncTransactions(userId, syncRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/transactions/clear")
    public ResponseEntity<Map<String, String>> clearTransactions(@RequestHeader("X-User-Id") Long userId) {
        logger.info("SyncController: Received request to clear all transactions for user: {}", userId);
        transactionService.clearAllTransactions(userId);
        return ResponseEntity.ok(Map.of("message", "All transactions soft-deleted successfully"));
    }

    @DeleteMapping("/transactions/unlink")
    public ResponseEntity<Map<String, String>> unlinkBank(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String bankName
    ) {
        logger.info("SyncController: Received request to unlink bank (soft delete) {} for user: {}", bankName, userId);
        transactionService.unlinkBank(userId, bankName);
        return ResponseEntity.ok(Map.of("message", "Bank unlinked successfully: " + bankName));
    }

    // Still using this for legacy display (banks) until UI is fully rewritten
    @GetMapping("/transactions/linked-banks")
    public ResponseEntity<List<String>> getLinkedBanks(@RequestHeader("X-User-Id") Long userId) {
        List<String> linkedBanks = transactionService.getLinkedBanks(userId);
        return ResponseEntity.ok(linkedBanks);
    }

    @GetMapping("/transactions/stats")
    public ResponseEntity<Map<String, Double>> getStats(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(transactionService.getCategoryStats(userId));
    }

    @GetMapping("/transactions/anomalies")
    public ResponseEntity<List<TransactionDto>> getAnomalies(@RequestHeader("X-User-Id") Long userId) {
        List<Transaction> list = transactionService.getTransactions(
                userId, null, null, null, null, null, null, true, null
        );
        List<TransactionDto> dtos = list.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private TransactionDto mapToDto(Transaction t) {
        if (t == null) return null;
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setExternalTransactionId(t.getExternalTransactionId());
        dto.setAmount(t.getAmount());
        dto.setCurrency(t.getCurrency());
        dto.setDate(t.getDate());
        dto.setDescription(t.getDescription());
        dto.setCategory(t.getCategory());
        dto.setMerchantName(t.getMerchantName());
        dto.setPending(t.getPending());
        dto.setAnomalyStatus(t.getAnomalyStatus());
        dto.setAnomalyDescription(t.getAnomalyDescription());
        dto.setNotes(t.getNotes());
        dto.setType(t.getType());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());

        if (t.getAccount() != null) {
            TransactionDto.AccountDto accDto = new TransactionDto.AccountDto();
            accDto.setId(t.getAccount().getId());
            accDto.setExternalAccountId(t.getAccount().getExternalAccountId());
            accDto.setName(t.getAccount().getName());
            accDto.setOfficialName(t.getAccount().getOfficialName());
            accDto.setMask(t.getAccount().getMask());
            accDto.setType(t.getAccount().getType());
            accDto.setSubtype(t.getAccount().getSubtype());
            accDto.setCurrency(t.getAccount().getCurrency());
            accDto.setCurrentBalance(t.getAccount().getCurrentBalance());
            accDto.setAvailableBalance(t.getAccount().getAvailableBalance());
            accDto.setBalanceLastUpdated(t.getAccount().getBalanceLastUpdated());
            accDto.setStatus(t.getAccount().getStatus());
            
            if (t.getAccount().getBankConnection() != null) {
                TransactionDto.BankConnectionDto bcDto = new TransactionDto.BankConnectionDto();
                bcDto.setId(t.getAccount().getBankConnection().getId());
                bcDto.setUserId(t.getAccount().getBankConnection().getUserId());
                bcDto.setInstitutionId(t.getAccount().getBankConnection().getInstitutionId());
                bcDto.setInstitutionName(t.getAccount().getBankConnection().getInstitutionName());
                bcDto.setPlaidItemId(t.getAccount().getBankConnection().getPlaidItemId());
                bcDto.setStatus(t.getAccount().getBankConnection().getStatus());
                bcDto.setLastSyncStarted(t.getAccount().getBankConnection().getLastSyncStarted());
                bcDto.setLastSyncCompleted(t.getAccount().getBankConnection().getLastSyncCompleted());
                bcDto.setLastSyncStatus(t.getAccount().getBankConnection().getLastSyncStatus());
                bcDto.setLastError(t.getAccount().getBankConnection().getLastError());
                bcDto.setCreatedAt(t.getAccount().getBankConnection().getCreatedAt());
                
                accDto.setBankConnection(bcDto);
            }
            dto.setAccount(accDto);
        }
        return dto;
    }
}
