package com.expense.categorizer.service;

import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.repository.TransactionRepository;
import com.expense.categorizer.repository.TransactionSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository repository;

    public List<Transaction> getTransactions(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            String category,
            String descriptionKeyword,
            Boolean anomalyOnly,
            String bankName
    ) {
        Specification<Transaction> spec = TransactionSpecification.getFilterSpecification(
                userId, startDate, endDate, minAmount, maxAmount, category, descriptionKeyword, anomalyOnly, bankName
        );
        return repository.findAll(spec);
    }

    public List<Transaction> getAllTransactions(Long userId) {
        return repository.findAll().stream()
                .filter(t -> userId != null && userId.equals(t.getUserId()))
                .collect(Collectors.toList());
    }

    public Transaction saveTransaction(Transaction transaction) {
        // Rule-based Auto Categorization if not provided
        if (transaction.getCategory() == null || transaction.getCategory().trim().isEmpty() || transaction.getCategory().equalsIgnoreCase("Uncategorized")) {
            transaction.setCategory(inferCategory(transaction.getDescription()));
        }
        
        if (transaction.getCurrency() == null) {
            transaction.setCurrency("INR");
        }
        
        if (transaction.getAnomalyStatus() == null) {
            transaction.setAnomalyStatus("NONE");
        }

        Transaction saved = repository.save(transaction);
        
        // Run anomaly detection for this transaction
        runAnomalyDetection(saved);
        
        return repository.save(saved);
    }

    public List<Transaction> saveTransactions(List<Transaction> transactions) {
        for (Transaction transaction : transactions) {
            if (transaction.getCategory() == null || transaction.getCategory().trim().isEmpty() || transaction.getCategory().equalsIgnoreCase("Uncategorized")) {
                transaction.setCategory(inferCategory(transaction.getDescription()));
            }
            if (transaction.getCurrency() == null) {
                transaction.setCurrency("INR");
            }
            if (transaction.getAnomalyStatus() == null) {
                transaction.setAnomalyStatus("NONE");
            }
        }
        
        List<Transaction> savedList = repository.saveAll(transactions);
        
        // Run batch anomaly detection
        runBatchAnomalyDetection(savedList);
        
        return repository.saveAll(savedList);
    }

    public void clearAllTransactions(Long userId) {
        repository.deleteByUserId(userId);
    }

    public void unlinkBank(Long userId, String bankName) {
        repository.deleteByUserIdAndBankName(userId, bankName);
    }

    public List<String> getLinkedBanks(Long userId) {
        return repository.findDistinctBankNamesByUserId(userId);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return repository.findById(id);
    }

    public void runBatchAnomalyDetection(List<Transaction> transactions) {
        if (transactions.isEmpty()) return;
        Long userId = transactions.get(0).getUserId();
        // Detect duplicates only within this user's data
        List<Transaction> userTransactions = repository.findAll().stream()
                .filter(t -> userId != null && userId.equals(t.getUserId()))
                .collect(Collectors.toList());
        for (Transaction t1 : transactions) {
            detectDuplicate(t1, userTransactions);
            detectSpike(t1, userTransactions);
            detectHighValue(t1);
        }
    }

    private void runAnomalyDetection(Transaction transaction) {
        Long userId = transaction.getUserId();
        List<Transaction> userTransactions = repository.findAll().stream()
                .filter(t -> userId != null && userId.equals(t.getUserId()))
                .collect(Collectors.toList());
        detectDuplicate(transaction, userTransactions);
        detectSpike(transaction, userTransactions);
        detectHighValue(transaction);
    }

    private void detectDuplicate(Transaction target, List<Transaction> searchPool) {
        if (target.getAmount() == null || target.getDate() == null) return;
        if ("CREDIT".equals(target.getType())) return;
        
        for (Transaction other : searchPool) {
            if (other.getId() != null && target.getId() != null && other.getId().equals(target.getId())) {
                continue;
            }
            if ("CREDIT".equals(other.getType())) {
                continue;
            }
            
            // Criteria: same amount, same merchant/description, date within 1 day
            boolean sameAmount = Math.abs(other.getAmount() - target.getAmount()) < 0.01;
            boolean sameMerchant = other.getDescription().equalsIgnoreCase(target.getDescription()) 
                    || (other.getMerchant() != null && target.getMerchant() != null && other.getMerchant().equalsIgnoreCase(target.getMerchant()));
            boolean closeDate = Math.abs(other.getDate().toEpochDay() - target.getDate().toEpochDay()) <= 1;

            if (sameAmount && sameMerchant && closeDate) {
                target.setAnomalyStatus("DUPLICATE_SUSPECT");
                target.setAnomalyDescription("Possible duplicate charge. Similar transaction found on " + other.getDate() + " with amount ₹" + other.getAmount());
                
                // Flag the other transaction too if it wasn't flagged
                if ("NONE".equals(other.getAnomalyStatus())) {
                    other.setAnomalyStatus("DUPLICATE_SUSPECT");
                    other.setAnomalyDescription("Possible duplicate charge. Similar transaction found on " + target.getDate() + " with amount ₹" + target.getAmount());
                    repository.save(other);
                }
                return;
            }
        }
    }

    private void detectSpike(Transaction target, List<Transaction> searchPool) {
        if (target.getCategory() == null || target.getAmount() == null) return;
        if ("CREDIT".equals(target.getType())) return;
        if ("DUPLICATE_SUSPECT".equals(target.getAnomalyStatus())) return; // duplicates take priority

        // Get average amount for this category (excluding credits)
        List<Transaction> categoryTransactions = searchPool.stream()
                .filter(t -> !"CREDIT".equals(t.getType()))
                .filter(t -> target.getCategory().equalsIgnoreCase(t.getCategory()))
                .filter(t -> t.getId() != null && !t.getId().equals(target.getId()))
                .collect(Collectors.toList());

        if (categoryTransactions.size() >= 3) {
            double avg = categoryTransactions.stream()
                    .mapToDouble(Transaction::getAmount)
                    .average()
                    .orElse(0.0);

            // If transaction is 3x or more than the average, alert
            if (target.getAmount() > (3 * avg) && target.getAmount() > 1000.0) {
                target.setAnomalyStatus("HIGH_SPIKE");
                target.setAnomalyDescription(String.format("Unusual spending spike! This expense is %.1fx higher than your average %s transaction (Avg: ₹%.2f).", 
                        (target.getAmount() / avg), target.getCategory(), avg));
            }
        }
    }

    private void detectHighValue(Transaction target) {
        if ("CREDIT".equals(target.getType())) return;
        if ("DUPLICATE_SUSPECT".equals(target.getAnomalyStatus()) || "HIGH_SPIKE".equals(target.getAnomalyStatus())) {
            return;
        }
        // Mark absolute high expenses e.g., above 15000 as high value anomalies if not already flagged
        if (target.getAmount() != null && target.getAmount() >= 15000.0) {
            target.setAnomalyStatus("HIGH_VALUE");
            target.setAnomalyDescription("Large expense alert! Transaction is above ₹15,000 threshold.");
        }
    }

    public String inferCategory(String description) {
        if (description == null) return "Uncategorized";
        String desc = description.toLowerCase();

        if (desc.contains("starbucks") || desc.contains("coffee") || desc.contains("cafe") || desc.contains("restaurant") || desc.contains("dining") || desc.contains("mcdonald") || desc.contains("burger") || desc.contains("pizza") || desc.contains("zomato") || desc.contains("swiggy")) {
            return "Dining";
        }
        if (desc.contains("uber") || desc.contains("lyft") || desc.contains("cab") || desc.contains("taxi") || desc.contains("metro") || desc.contains("train") || desc.contains("flight") || desc.contains("airline") || desc.contains("fuel") || desc.contains("petrol") || desc.contains("gas")) {
            return "Transportation";
        }
        if (desc.contains("walmart") || desc.contains("grocery") || desc.contains("supermarket") || desc.contains("whole foods") || desc.contains("trader") || desc.contains("kroger") || desc.contains("reliance fresh") || desc.contains("blinkit") || desc.contains("zepto") || desc.contains("instamart")) {
            return "Grocery";
        }
        if (desc.contains("netflix") || desc.contains("spotify") || desc.contains("disney") || desc.contains("prime video") || desc.contains("youtube premium") || desc.contains("ticket") || desc.contains("movie") || desc.contains("cinema") || desc.contains("steam") || desc.contains("game")) {
            return "Entertainment";
        }
        if (desc.contains("rent") || desc.contains("landlord") || desc.contains("lease") || desc.contains("pg stay")) {
            return "Rent";
        }
        if (desc.contains("electric") || desc.contains("water bill") || desc.contains("electricity") || desc.contains("broadband") || desc.contains("wifi") || desc.contains("mobile recharge") || desc.contains("jio") || desc.contains("airtel") || desc.contains("gas bill") || desc.contains("insurance")) {
            return "Bills";
        }
        if (desc.contains("amazon") || desc.contains("target") || desc.contains("flipkart") || desc.contains("myntra") || desc.contains("mall") || desc.contains("shopping") || desc.contains("clothing")) {
            return "Shopping";
        }
        if (desc.contains("salary") || desc.contains("direct deposit") || desc.contains("refund") || desc.contains("cashback") || desc.contains("interest paid")) {
            return "Income";
        }
        if (desc.contains("hospital") || desc.contains("pharmacy") || desc.contains("medical") || desc.contains("doctor") || desc.contains("apollo")) {
            return "Medical";
        }

        return "Uncategorized";
    }

    public Map<String, Double> getCategoryStats(Long userId) {
        List<Transaction> transactions = repository.findAll().stream()
                .filter(t -> userId != null && userId.equals(t.getUserId()))
                .collect(Collectors.toList());
        return transactions.stream()
                .filter(t -> t.getAmount() != null && t.getCategory() != null && !"Income".equalsIgnoreCase(t.getCategory()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }
}
