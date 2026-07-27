package com.expense.categorizer.dto;

import lombok.Data;
import java.util.List;

@Data
public class LinkBankResponse {
    private InstitutionDto institution;
    private ItemDto item;
    private List<AccountDto> accounts;

    @Data
    public static class InstitutionDto {
        private String institutionId;
        private String name;
    }

    @Data
    public static class ItemDto {
        private String itemId;
    }

    @Data
    public static class AccountDto {
        private String accountId; // externalAccountId
        private String name;
        private String officialName;
        private String mask;
        private String type;
        private String subtype;
        private String currency;
        private Double currentBalance;
    }
}
