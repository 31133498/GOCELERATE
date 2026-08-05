package com.gocelerate.gocelerate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be a positive value in Naira")
    private BigDecimal amount;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;
}
