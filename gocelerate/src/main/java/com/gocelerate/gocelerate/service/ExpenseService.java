package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ExpenseDto;
import com.gocelerate.gocelerate.dto.ExpenseRequest;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.repository.ExpenseRepository;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectService projectService;

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

    public List<ExpenseDto> getAllExpenses(String category, LocalDate from, LocalDate to) {
        List<Long> accessibleProjectIds = projectService.getAccessibleProjectIds();

        return expenseRepository.findAll().stream()
                .filter(e -> accessibleProjectIds.contains(e.getMilestone().getProject().getId()))
                .filter(e -> category == null || e.getCategory().equalsIgnoreCase(category))
                .filter(e -> from == null || (e.getLoggedAt() != null && !e.getLoggedAt().toLocalDate().isBefore(from)))
                .filter(e -> to == null || (e.getLoggedAt() != null && !e.getLoggedAt().toLocalDate().isAfter(to)))
                .map(e -> {
                    Milestone m = e.getMilestone();
                    return new ExpenseDto(
                            e.getId(),
                            m.getId(),
                            m.getTitle(),
                            m.getProject().getId(),
                            m.getProject().getTitle(),
                            e.getDescription(),
                            e.getAmount().doubleValue(),
                            e.getCategory(),
                            e.getLoggedAt() != null ? e.getLoggedAt().toLocalDate().toString() : null
                    );
                })
                .collect(Collectors.toList());
    }
}
