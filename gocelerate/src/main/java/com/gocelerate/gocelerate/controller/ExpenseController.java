package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.ExpenseRequest;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Expenses", description = "Log and retrieve expenses against milestones")
@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @Operation(summary = "Log an expense against a milestone", description = "Records a new expense entry under the specified milestone")
    @PostMapping("/api/milestones/{id}/expenses")
    public ResponseEntity<ApiResponse<Expense>> logExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Expense logged", expenseService.logExpense(id, request)));
    }

    @Operation(summary = "Get expenses for a milestone", description = "Returns all expense entries recorded against the specified milestone")
    @GetMapping("/api/milestones/{id}/expenses")
    public ResponseEntity<ApiResponse<List<Expense>>> getExpenses(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved", expenseService.getExpensesForMilestone(id)));
    }
}
