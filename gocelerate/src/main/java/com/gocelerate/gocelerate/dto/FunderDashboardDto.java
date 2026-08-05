package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FunderDashboardDto {

    private double totalPledged;
    private int projectsFunded;
    private long milestonesCompleted;
    private double avgCompletionRate;

    private List<FundedProjectSummary> portfolio;
    private List<DashboardStatsDto.StatusBreakdown> milestoneStatusBreakdown;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FundedProjectSummary {
        private Long id;
        private String title;
        private String category;
        private String status;
        private String imageUrl;
        private double myPledge;
        private double targetBudget;
        private double totalSpent;
        private int milestonesCount;
        private int milestonesCompleted;
        private String createdAt;
    }
}
