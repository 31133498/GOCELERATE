package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ProjectReport;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.repository.ExpenseRepository;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import com.gocelerate.gocelerate.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final ExpenseRepository expenseRepository;

    public ProjectReport generateReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Milestone> milestones = milestoneRepository.findByProjectId(projectId);

        BigDecimal totalSpent = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        List<ProjectReport.MilestoneSummary> milestoneSummaries = new ArrayList<>();

        for (Milestone milestone : milestones) {
            List<Expense> expenses = expenseRepository.findByMilestoneId(milestone.getId());

            BigDecimal milestoneTotal = expenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            totalSpent = totalSpent.add(milestoneTotal);

            // Accumulate expenses into category buckets for the breakdown section of the report.
            for (Expense expense : expenses) {
                expenseByCategory.merge(expense.getCategory(), expense.getAmount(), BigDecimal::add);
            }

            milestoneSummaries.add(ProjectReport.MilestoneSummary.builder()
                    .id(milestone.getId())
                    .title(milestone.getTitle())
                    .status(milestone.getStatus().name())
                    .totalExpenses(milestoneTotal)
                    .build());
        }

        // Completion % = completed milestones / total milestones x 100
        long completedCount = milestones.stream()
                .filter(m -> m.getStatus() == Milestone.Status.COMPLETED)
                .count();
        double completionPercentage = milestones.isEmpty()
                ? 0.0
                : (double) completedCount / milestones.size() * 100.0;

        return ProjectReport.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .status(project.getStatus().name())
                .targetBudget(project.getTargetBudget())
                .totalSpent(totalSpent)
                .completionPercentage(completionPercentage)
                .expenseByCategory(expenseByCategory)
                .milestones(milestoneSummaries)
                .build();
    }
}
