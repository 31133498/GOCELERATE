package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.DashboardStatsDto;
import com.gocelerate.gocelerate.dto.FunderDashboardDto;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.model.FunderProject;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.model.User;
import com.gocelerate.gocelerate.repository.ExpenseRepository;
import com.gocelerate.gocelerate.repository.FunderProjectRepository;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import com.gocelerate.gocelerate.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final ExpenseRepository expenseRepository;
    private final ProjectService projectService;
    private final FunderProjectRepository funderProjectRepository;

    public DashboardStatsDto getStats() {
        // Only include projects accessible to the current user
        List<Long> accessibleIds = projectService.getAccessibleProjectIds();

        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> accessibleIds.contains(p.getId()))
                .collect(Collectors.toList());

        List<Milestone> allMilestones = milestoneRepository.findAll().stream()
                .filter(m -> accessibleIds.contains(m.getProject().getId()))
                .collect(Collectors.toList());

        List<Expense> allExpenses = expenseRepository.findAll().stream()
                .filter(e -> accessibleIds.contains(e.getMilestone().getProject().getId()))
                .collect(Collectors.toList());

        Map<Long, List<Milestone>> milestonesByProject = allMilestones.stream()
                .collect(Collectors.groupingBy(m -> m.getProject().getId()));
        Map<Long, BigDecimal> expensesByProject = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getMilestone().getProject().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        long totalProjects = projects.size();
        long activeProjects = projects.stream().filter(p -> p.getStatus() == Project.Status.ACTIVE).count();
        double totalBudget = projects.stream().mapToDouble(p -> p.getTargetBudget().doubleValue()).sum();
        long milestonesCompleted = allMilestones.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();

        List<DashboardStatsDto.ProjectSummary> recentProjects = projects.stream()
                .sorted(Comparator.comparing(Project::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(p -> {
                    List<Milestone> pm = milestonesByProject.getOrDefault(p.getId(), List.of());
                    int mDone = (int) pm.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
                    double spent = expensesByProject.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue();
                    String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
                    return new DashboardStatsDto.ProjectSummary(
                            p.getId(), p.getTitle(), p.getDescription(), p.getCategory(),
                            p.getStatus().name(), p.getTargetBudget().doubleValue(),
                            spent, pm.size(), mDone, createdAt, createdAt);
                })
                .collect(Collectors.toList());

        List<DashboardStatsDto.BudgetVsExpense> budgetVsExpenses = projects.stream()
                .map(p -> new DashboardStatsDto.BudgetVsExpense(
                        p.getTitle(),
                        p.getTargetBudget().doubleValue(),
                        expensesByProject.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue()
                ))
                .collect(Collectors.toList());

        Map<Milestone.Status, Long> statusCounts = allMilestones.stream()
                .collect(Collectors.groupingBy(Milestone::getStatus, Collectors.counting()));
        List<DashboardStatsDto.StatusBreakdown> milestoneStatusBreakdown = Arrays.stream(Milestone.Status.values())
                .map(s -> new DashboardStatsDto.StatusBreakdown(
                        s.name().replace("_", " "),
                        statusCounts.getOrDefault(s, 0L)))
                .collect(Collectors.toList());

        return new DashboardStatsDto(totalProjects, activeProjects, totalBudget, milestonesCompleted,
                recentProjects, budgetVsExpenses, milestoneStatusBreakdown);
    }

    public FunderDashboardDto getFunderStats() {
        User currentUser = projectService.getCurrentUser();
        List<FunderProject> myPledges = funderProjectRepository.findByFunder(currentUser);

        double totalPledged = myPledges.stream()
                .mapToDouble(fp -> fp.getAmountPledged().doubleValue())
                .sum();

        int projectsFunded = myPledges.size();

        List<Long> fundedProjectIds = myPledges.stream()
                .map(fp -> fp.getProject().getId())
                .collect(Collectors.toList());

        List<Milestone> allMilestones = milestoneRepository.findAll().stream()
                .filter(m -> fundedProjectIds.contains(m.getProject().getId()))
                .collect(Collectors.toList());

        long milestonesCompleted = allMilestones.stream()
                .filter(m -> m.getStatus() == Milestone.Status.COMPLETED)
                .count();

        Map<Long, List<Milestone>> milestonesByProject = allMilestones.stream()
                .collect(Collectors.groupingBy(m -> m.getProject().getId()));

        double avgCompletionRate = 0;
        if (projectsFunded > 0) {
            avgCompletionRate = myPledges.stream().mapToDouble(fp -> {
                List<Milestone> pm = milestonesByProject.getOrDefault(fp.getProject().getId(), List.of());
                if (pm.isEmpty()) return 0;
                long done = pm.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
                return (double) done / pm.size() * 100;
            }).average().orElse(0);
        }

        Map<Long, BigDecimal> expensesByProject = expenseRepository.findAll().stream()
                .filter(e -> fundedProjectIds.contains(e.getMilestone().getProject().getId()))
                .collect(Collectors.groupingBy(
                        e -> e.getMilestone().getProject().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        List<FunderDashboardDto.FundedProjectSummary> portfolio = myPledges.stream()
                .map(fp -> {
                    Project p = fp.getProject();
                    List<Milestone> pm = milestonesByProject.getOrDefault(p.getId(), List.of());
                    int mDone = (int) pm.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
                    double spent = expensesByProject.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue();
                    String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
                    return new FunderDashboardDto.FundedProjectSummary(
                            p.getId(), p.getTitle(), p.getCategory(),
                            p.getStatus().name(), p.getImageUrl(),
                            fp.getAmountPledged().doubleValue(),
                            p.getTargetBudget().doubleValue(),
                            spent, pm.size(), mDone, createdAt
                    );
                })
                .collect(Collectors.toList());

        Map<Milestone.Status, Long> statusCounts = allMilestones.stream()
                .collect(Collectors.groupingBy(Milestone::getStatus, Collectors.counting()));
        List<DashboardStatsDto.StatusBreakdown> milestoneStatusBreakdown = Arrays.stream(Milestone.Status.values())
                .map(s -> new DashboardStatsDto.StatusBreakdown(
                        s.name().replace("_", " "),
                        statusCounts.getOrDefault(s, 0L)))
                .collect(Collectors.toList());

        return new FunderDashboardDto(
                totalPledged, projectsFunded, milestonesCompleted, avgCompletionRate,
                portfolio, milestoneStatusBreakdown
        );
    }
}
