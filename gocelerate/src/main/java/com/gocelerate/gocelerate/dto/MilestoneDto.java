package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MilestoneDto {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private String title;
    private String description;
    private String status;
    private String dueDate;
    private double totalExpenses;
    private String createdAt;
    private String evidenceImageUrl;
}
