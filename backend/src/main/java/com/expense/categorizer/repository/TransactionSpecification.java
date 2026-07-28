package com.expense.categorizer.repository;

import com.expense.categorizer.model.Transaction;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> getFilterSpecification(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            String category,
            String search,
            Boolean anomalyOnly,
            String bankName // keep for backwards compatibility if needed, though we should probably use institutionId.
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User ID mapping via Account -> BankConnection -> userId
            predicates.add(cb.equal(root.get("account").get("bankConnection").get("userId"), userId));

            // Only ACTIVE transactions
            predicates.add(cb.or(
                cb.equal(root.get("status"), "ACTIVE"),
                cb.isNull(root.get("status")) // for legacy mocks if status is null
            ));

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), endDate));
            }

            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            if (category != null && !category.trim().isEmpty() && !"All".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate descriptionPredicate = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate merchantPredicate = cb.like(cb.lower(root.get("merchantName")), searchPattern);
                Predicate categoryPredicate = cb.like(cb.lower(root.get("category")), searchPattern);
                predicates.add(cb.or(descriptionPredicate, merchantPredicate, categoryPredicate));
            }

            if (Boolean.TRUE.equals(anomalyOnly)) {
                predicates.add(cb.isNotNull(root.get("anomalyStatus")));
                predicates.add(cb.notEqual(root.get("anomalyStatus"), "NONE"));
            }

            if (bankName != null && !bankName.trim().isEmpty()) {
                // Map to institutionName
                predicates.add(cb.equal(cb.lower(root.get("account").get("bankConnection").get("institutionName")), bankName.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
