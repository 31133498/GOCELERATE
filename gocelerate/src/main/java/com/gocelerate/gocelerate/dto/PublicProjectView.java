package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicProjectView {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String imageUrl;
    private double targetBudget;
    private double totalPledged;
    private double totalSpent;
    private int milestonesCount;
    private int milestonesCompleted;
    private String createdAt;
    private List<MilestoneInfo> milestones;
    private List<FunderInfo> funders;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class MilestoneInfo {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String dueDate;
        private String evidenceImageUrl;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class FunderInfo {
        private String name;
        private double amountPledged;
        private String pledgedAt;
    }
}
