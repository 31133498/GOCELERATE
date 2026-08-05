package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardStatsDto {

    private long totalProjects;
    private long activeProjects;
    private double totalBudget;
    private long milestonesCompleted;
    private List<ProjectSummary> recentProjects;
    private List<BudgetVsExpense> budgetVsExpenses;
    private List<StatusBreakdown> milestoneStatusBreakdown;

    // All monetary values in this response are denominated in Nigerian Naira (NGN).
    public String getCurrency() { return "NGN"; }

    @Data
    @AllArgsConstructor
    public static class ProjectSummary {
        private Long id;
        private String title;
        private String description;
        private String category;
        private String status;
        private double targetBudget;
        private double totalSpent;
        private int milestonesCount;
        private int milestonesCompleted;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @AllArgsConstructor
    public static class BudgetVsExpense {
        private String name;
        private double budget;
        private double expenses;
    }

    @Data
    @AllArgsConstructor
    public static class StatusBreakdown {
        private String name;
        private long value;
    }
}
