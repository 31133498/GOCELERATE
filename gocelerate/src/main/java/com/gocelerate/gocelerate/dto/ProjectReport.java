package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectReport {

    private ProjectDto project;
    private double totalBudget;
    private double totalSpent;
    private double remainingBudget;
    private double milestoneCompletion;
    private List<ExpenseByCategory> expensesByCategory;
    private List<MilestoneStatus> milestoneStatus;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExpenseByCategory {
        private String category;
        private double amount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MilestoneStatus {
        private String status;
        private long count;
    }
}
