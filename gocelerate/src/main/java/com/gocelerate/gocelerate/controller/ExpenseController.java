package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.ExpenseDto;
import com.gocelerate.gocelerate.dto.ExpenseRequest;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Expenses", description = "Log and retrieve expenses against milestones. All amounts are in Nigerian Naira (NGN).")
@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @Operation(summary = "List all expenses", description = "Returns all accessible expenses in Naira (NGN), optionally filtered by category and date range (YYYY-MM-DD).")
    @GetMapping("/api/expenses")
    public ResponseEntity<ApiResponse<List<ExpenseDto>>> getAllExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved", expenseService.getAllExpenses(category, from, to)));
    }

    @Operation(summary = "Log an expense against a milestone", description = "Records a new expense entry in Naira (NGN) under the specified milestone.")
    @PostMapping("/api/milestones/{id}/expenses")
    public ResponseEntity<ApiResponse<Expense>> logExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Expense logged", expenseService.logExpense(id, request)));
    }

    @Operation(summary = "Get expenses for a milestone", description = "Returns all expense entries in Naira (NGN) recorded against the specified milestone.")
    @GetMapping("/api/milestones/{id}/expenses")
    public ResponseEntity<ApiResponse<List<Expense>>> getExpensesForMilestone(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved", expenseService.getExpensesForMilestone(id)));
    }
}
