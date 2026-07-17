package com.expense.categorizer.repository;

import com.expense.categorizer.model.Transaction;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> getFilterSpecification(
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            String category,
            String descriptionKeyword,
            Boolean anomalyOnly,
            String bankName
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

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

            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (descriptionKeyword != null && !descriptionKeyword.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("description")), "%" + descriptionKeyword.trim().toLowerCase() + "%"));
            }

            if (anomalyOnly != null && anomalyOnly) {
                predicates.add(cb.notEqual(root.get("anomalyStatus"), "NONE"));
            }

            if (bankName != null && !bankName.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("bankName")), bankName.trim().toLowerCase()));
            }

            query.orderBy(cb.desc(root.get("date")), cb.desc(root.get("id")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
