package com.gocelerate.gocelerate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private Long milestoneId;
    private String milestoneTitle;
    private Long projectId;
    private String projectTitle;
    private String description;
    private double amount;
    private String category;
    private String date;

    // All monetary values in this response are denominated in Nigerian Naira (NGN).
    public String getCurrency() { return "NGN"; }
}
