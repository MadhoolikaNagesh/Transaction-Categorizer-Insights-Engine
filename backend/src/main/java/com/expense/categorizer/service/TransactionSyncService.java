package com.expense.categorizer.service;

import com.expense.categorizer.dto.SyncRequest;
import com.expense.categorizer.dto.SyncSummaryResponse;
import com.expense.categorizer.model.Account;
import com.expense.categorizer.model.BankConnection;
import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.repository.AccountRepository;
import com.expense.categorizer.repository.BankConnectionRepository;
import com.expense.categorizer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class TransactionSyncService {

    @Autowired
    private BankConnectionRepository bankConnectionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionService transactionService; // for anomaly detection and inference

    @Transactional
    public SyncSummaryResponse syncTransactions(Long userId, SyncRequest syncRequest) {
        BankConnection bankConnection = bankConnectionRepository.findByUserIdAndPlaidItemId(userId, syncRequest.getItem().getItemId())
                .orElseGet(() -> BankConnection.builder()
                        .userId(userId)
                        .institutionId(syncRequest.getInstitution().getInstitutionId())
                        .institutionName(syncRequest.getInstitution().getName())
                        .plaidItemId(syncRequest.getItem().getItemId())
                        .encryptedAccessToken("enc_token_" + UUID.randomUUID().toString()) // mock encrypted token
                        .status("ACTIVE")
                        .build());
        
        bankConnection.setLastSyncStarted(LocalDateTime.now());
        bankConnection.setStatus("ACTIVE");
        bankConnection = bankConnectionRepository.save(bankConnection);
        
        int added = 0;
        int modified = 0;
        int removed = 0;

        final BankConnection finalBankConnection = bankConnection;
        for (SyncRequest.AccountDto accDto : syncRequest.getAccounts()) {
            Account account = accountRepository.findByBankConnectionIdAndExternalAccountId(finalBankConnection.getId(), accDto.getAccountId())
                    .orElseGet(() -> Account.builder()
                            .bankConnection(finalBankConnection)
                            .externalAccountId(accDto.getAccountId())
                            .name(accDto.getName())
                            .officialName(accDto.getOfficialName())
                            .mask(accDto.getMask())
                            .type(accDto.getType())
                            .subtype(accDto.getSubtype())
                            .currency(accDto.getCurrency())
                            .status("ACTIVE")
                            .build());

            account.setCurrentBalance(accDto.getCurrentBalance());
            account.setAvailableBalance(accDto.getCurrentBalance() * 0.95); // Just some mock diff
            account.setBalanceLastUpdated(LocalDateTime.now());
            account.setStatus("ACTIVE");
            account = accountRepository.save(account);

            // Generate contextual transactions
            List<Transaction> mockTransactions = generateContextualMockTransactions(account);

            for (Transaction mockTx : mockTransactions) {
                Optional<Transaction> existing = transactionRepository.findByAccountIdAndExternalTransactionId(account.getId(), mockTx.getExternalTransactionId());
                if (existing.isPresent()) {
                    Transaction tx = existing.get();
                    if (tx.getPending() && !mockTx.getPending()) {
                        tx.setPending(false);
                        transactionRepository.save(tx);
                        modified++;
                    }
                } else {
                    mockTx.setAccount(account);
                    // Use TransactionService to categorize and detect anomalies
                    mockTx.setCategory(transactionService.inferCategory(mockTx.getDescription()));
                    transactionService.detectAnomalies(mockTx);
                    transactionRepository.save(mockTx);
                    added++;
                }
            }
        }

        bankConnection.setLastSyncCompleted(LocalDateTime.now());
        bankConnection.setLastSyncStatus("SUCCESS");
        // Simulate a new cursor
        bankConnection.setSyncCursor("cursor_" + UUID.randomUUID().toString());
        bankConnectionRepository.save(bankConnection);

        return SyncSummaryResponse.builder()
                .added(added)
                .modified(modified)
                .removed(removed)
                .status("SUCCESS")
                .build();
    }

    private List<Transaction> generateContextualMockTransactions(Account account) {
        List<Transaction> txs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        // Randomly generate 5-10 transactions per sync to simulate a delta
        int count = 5 + (int)(Math.random() * 6);
        
        for (int i = 0; i < count; i++) {
            boolean isPending = Math.random() < 0.2; // 20% pending
            LocalDate date = today.minusDays((int)(Math.random() * 30));
            double amount = 0.0;
            String desc = "";
            String merchant = "";
            String type = "DEBIT";

            if ("depository".equalsIgnoreCase(account.getType())) {
                if (Math.random() < 0.3) {
                    type = "CREDIT";
                    amount = 50000.0 + (Math.random() * 50000);
                    desc = "Salary Direct Deposit";
                    merchant = "Employer Inc";
                } else {
                    amount = 500.0 + (Math.random() * 4500);
                    String[] merchants = {"Walmart", "Starbucks", "Uber", "Zomato", "Electric Bill", "Amazon"};
                    merchant = merchants[(int)(Math.random() * merchants.length)];
                    desc = merchant + " Payment";
                }
            } else if ("credit".equalsIgnoreCase(account.getType())) {
                amount = 200.0 + (Math.random() * 8000);
                String[] merchants = {"Netflix", "Amazon", "Swiggy", "Uber", "Steam", "Spotify"};
                merchant = merchants[(int)(Math.random() * merchants.length)];
                desc = merchant + " Charge";
            } else {
                amount = 100.0 + (Math.random() * 1000);
                desc = "Generic Transaction";
                merchant = "Generic Merchant";
            }

            // We simulate a predictable externalTransactionId so re-syncs can match
            // We use merchant+date as a mock stable ID key for the mock generator
            String externalId = "tx_" + Math.abs((merchant + date.toString() + amount).hashCode());

            Transaction tx = Transaction.builder()
                    .externalTransactionId(externalId)
                    .amount(amount)
                    .currency("INR")
                    .date(date)
                    .description(desc)
                    .merchantName(merchant)
                    .pending(isPending)
                    .type(type)
                    .anomalyStatus("NONE")
                    .status("ACTIVE")
                    .build();
            
            txs.add(tx);
        }
        
        return txs;
    }
}
