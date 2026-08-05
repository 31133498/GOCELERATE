package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ExpenseRequest;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.repository.ExpenseRepository;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MilestoneRepository milestoneRepository;

    public Expense logExpense(Long milestoneId, ExpenseRequest request) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        Expense expense = Expense.builder()
                .milestone(milestone)
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesForMilestone(Long milestoneId) {
        return expenseRepository.findByMilestoneId(milestoneId);
    }
}
