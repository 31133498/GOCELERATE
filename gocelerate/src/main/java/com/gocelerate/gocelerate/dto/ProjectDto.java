package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectDto {
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
    private Double amountPledged;
    private String imageUrl;
}
