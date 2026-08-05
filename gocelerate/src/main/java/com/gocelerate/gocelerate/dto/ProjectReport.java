package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// The full project summary returned by GET /api/projects/{id}/report
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectReport {

    private Long projectId;
    private String title;
    private String status;
    private BigDecimal targetBudget;
    private BigDecimal totalSpent;
    private double completionPercentage;
    private Map<String, BigDecimal> expenseByCategory;
    private List<MilestoneSummary> milestones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneSummary {
        private Long id;
        private String title;
        private String status;
        private BigDecimal totalExpenses;
    }
}
