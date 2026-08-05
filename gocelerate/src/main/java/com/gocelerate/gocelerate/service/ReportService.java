package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ProjectDto;
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
import java.util.*;
import java.util.stream.Collectors;

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
        List<Expense> allExpenses = milestones.stream()
                .flatMap(m -> expenseRepository.findByMilestoneId(m.getId()).stream())
                .collect(Collectors.toList());

        double totalSpent = allExpenses.stream()
                .mapToDouble(e -> e.getAmount().doubleValue())
                .sum();
        double totalBudget = project.getTargetBudget().doubleValue();

        // Expenses grouped by category
        Map<String, Double> categoryMap = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(e -> e.getAmount().doubleValue())
                ));
        List<ProjectReport.ExpenseByCategory> expensesByCategory = categoryMap.entrySet().stream()
                .map(e -> new ProjectReport.ExpenseByCategory(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Milestone status counts
        Map<String, Long> statusCounts = milestones.stream()
                .collect(Collectors.groupingBy(m -> m.getStatus().name(), Collectors.counting()));
        List<ProjectReport.MilestoneStatus> milestoneStatus = Arrays.stream(Milestone.Status.values())
                .map(s -> new ProjectReport.MilestoneStatus(s.name(), statusCounts.getOrDefault(s.name(), 0L)))
                .collect(Collectors.toList());

        long completedCount = milestones.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
        double milestoneCompletion = milestones.isEmpty() ? 0.0 : (double) completedCount / milestones.size() * 100.0;

        int mDone = (int) completedCount;
        String createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
        ProjectDto projectDto = new ProjectDto(
                project.getId(), project.getTitle(), project.getDescription(),
                project.getCategory(), project.getStatus().name(),
                totalBudget, totalSpent, milestones.size(), mDone, createdAt, createdAt, null, project.getImageUrl());

        return new ProjectReport(projectDto, totalBudget, totalSpent, totalBudget - totalSpent,
                milestoneCompletion, expensesByCategory, milestoneStatus);
    }
}
