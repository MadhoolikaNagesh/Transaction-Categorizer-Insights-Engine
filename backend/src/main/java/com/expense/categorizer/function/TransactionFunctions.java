package com.expense.categorizer.function;

import com.expense.categorizer.model.Transaction;
import com.expense.categorizer.service.TransactionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

@Configuration
public class TransactionFunctions {

    public record TransactionQueryRequest(
            String startDate,       // YYYY-MM-DD
            String endDate,         // YYYY-MM-DD
            Double minAmount,
            Double maxAmount,
            String category,
            String descriptionKeyword,
            Boolean anomalyOnly,
            String bankName
    ) {}

    public record TransactionQueryResponse(
            List<Transaction> transactions,
            int count,
            double totalAmount,
            String message
    ) {}

    @Bean
    @Description("Queries the database of financial transactions based on filters like date range, amount range, category, merchant name (descriptionKeyword), and anomalies. Dates must be in YYYY-MM-DD format.")
    public Function<TransactionQueryRequest, TransactionQueryResponse> queryTransactions(TransactionService transactionService) {
        return request -> {
            LocalDate start = parseDate(request.startDate());
            LocalDate end = parseDate(request.endDate());
            Long userId = com.expense.categorizer.context.UserContext.getUserId();
            
            List<Transaction> list = transactionService.getTransactions(
                    userId,
                    start,
                    end,
                    request.minAmount(),
                    request.maxAmount(),
                    request.category(),
                    request.descriptionKeyword(),
                    request.anomalyOnly(),
                    request.bankName()
            );

            double sum = list.stream()
                    .filter(t -> t.getAmount() != null)
                    .mapToDouble(Transaction::getAmount)
                    .sum();

            String msg = String.format("Found %d transactions matching query. Total sum of matching: ₹%.2f", list.size(), sum);
            return new TransactionQueryResponse(list, list.size(), sum, msg);
        };
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (Exception e) {
            // Log and return null on invalid format
            return null;
        }
    }
}
