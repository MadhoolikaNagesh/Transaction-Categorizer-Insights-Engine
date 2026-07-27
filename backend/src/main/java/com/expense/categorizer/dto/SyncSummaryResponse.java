package com.expense.categorizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncSummaryResponse {
    private int added;
    private int modified;
    private int removed;
    private String status;
}
