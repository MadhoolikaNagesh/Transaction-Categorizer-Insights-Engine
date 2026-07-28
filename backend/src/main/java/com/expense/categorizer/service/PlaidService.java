package com.expense.categorizer.service;

import com.expense.categorizer.dto.LinkBankResponse;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.UUID;

@Service
public class PlaidService {

    public LinkBankResponse mockLinkBank(String bankName) {
        LinkBankResponse response = new LinkBankResponse();
        
        LinkBankResponse.InstitutionDto institution = new LinkBankResponse.InstitutionDto();
        institution.setInstitutionId("ins_" + UUID.randomUUID().toString().substring(0, 8));
        institution.setName(bankName != null ? bankName : "Mock Institution");
        response.setInstitution(institution);
        
        LinkBankResponse.ItemDto item = new LinkBankResponse.ItemDto();
        item.setItemId("item_" + UUID.randomUUID().toString().substring(0, 8));
        response.setItem(item);
        
        LinkBankResponse.AccountDto checking = new LinkBankResponse.AccountDto();
        checking.setAccountId("acc_" + UUID.randomUUID().toString().substring(0, 8));
        checking.setName("Checking");
        checking.setOfficialName(bankName + " Total Checking");
        checking.setMask(String.valueOf(1000 + (int)(Math.random() * 8999)));
        checking.setType("depository");
        checking.setSubtype("checking");
        checking.setCurrency("INR");
        checking.setCurrentBalance(15000.0 + (Math.random() * 50000));
        
        LinkBankResponse.AccountDto credit = new LinkBankResponse.AccountDto();
        credit.setAccountId("acc_" + UUID.randomUUID().toString().substring(0, 8));
        credit.setName("Credit Card");
        credit.setOfficialName(bankName + " Rewards Credit");
        credit.setMask(String.valueOf(1000 + (int)(Math.random() * 8999)));
        credit.setType("credit");
        credit.setSubtype("credit card");
        credit.setCurrency("INR");
        credit.setCurrentBalance(5000.0 + (Math.random() * 20000));
        
        response.setAccounts(Arrays.asList(checking, credit));
        return response;
    }
}
