package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ProjectDto;
import com.gocelerate.gocelerate.dto.ProjectRequest;
import com.gocelerate.gocelerate.dto.PublicProjectView;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Expense;
import com.gocelerate.gocelerate.model.FunderProject;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.model.User;
import com.gocelerate.gocelerate.repository.ExpenseRepository;
import com.gocelerate.gocelerate.repository.FunderProjectRepository;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import com.gocelerate.gocelerate.repository.ProjectRepository;
import com.gocelerate.gocelerate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final ExpenseRepository expenseRepository;
    private final FunderProjectRepository funderProjectRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public List<ProjectDto> getAllProjects(Project.Status statusFilter) {
        User currentUser = getCurrentUser();
        List<Project> projects;
        Map<Long, Double> pledgesByProjectId;

        if (currentUser.getRole() == User.Role.IMPLEMENTER) {
            projects = projectRepository.findByImplementer(currentUser);
            pledgesByProjectId = Map.of();
        } else {
            // Funders see ALL projects on the platform
            projects = projectRepository.findAll();
            // Build a map of which projects this funder has already pledged to
            pledgesByProjectId = funderProjectRepository.findByFunder(currentUser).stream()
                    .collect(Collectors.toMap(
                            fp -> fp.getProject().getId(),
                            fp -> fp.getAmountPledged().doubleValue()
                    ));
        }

        if (statusFilter != null) {
            projects = projects.stream()
                    .filter(p -> p.getStatus() == statusFilter)
                    .collect(Collectors.toList());
        }

        return enrichProjects(projects, pledgesByProjectId);
    }

    public Project createProject(ProjectRequest request) {
        User user = getCurrentUser();
        if (user.getRole() != User.Role.IMPLEMENTER) {
            throw new RuntimeException("Only implementers can create projects");
        }
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .targetBudget(request.getTargetBudget())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .implementer(user)
                .status(Project.Status.PENDING)
                .build();
        return projectRepository.save(project);
    }

    public ProjectDto getProjectById(Long id) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        List<Milestone> milestones = milestoneRepository.findByProjectId(id);
        BigDecimal totalSpent = milestones.stream()
                .flatMap(m -> expenseRepository.findByMilestoneId(m.getId()).stream())
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int mDone = (int) milestones.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
        String createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;

        Double amountPledged = null;
        if (currentUser.getRole() == User.Role.FUNDER) {
            Optional<FunderProject> fp = funderProjectRepository.findByFunderAndProject(currentUser, project);
            amountPledged = fp.map(f -> f.getAmountPledged().doubleValue()).orElse(null);
        }

        return new ProjectDto(project.getId(), project.getTitle(), project.getDescription(),
                project.getCategory(), project.getStatus().name(),
                project.getTargetBudget().doubleValue(), totalSpent.doubleValue(),
                milestones.size(), mDone, createdAt, createdAt, amountPledged, project.getImageUrl());
    }

    public Project updateProjectStatus(Long id, Project.Status status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        project.setStatus(status);
        return projectRepository.save(project);
    }

    public FunderProject fundProject(Long projectId, BigDecimal amountPledged) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.FUNDER) {
            throw new RuntimeException("Only funders can pledge to projects");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Optional<FunderProject> existing = funderProjectRepository.findByFunderAndProject(currentUser, project);
        if (existing.isPresent()) {
            FunderProject fp = existing.get();
            fp.setAmountPledged(amountPledged);
            return funderProjectRepository.save(fp);
        }

        return funderProjectRepository.save(FunderProject.builder()
                .funder(currentUser)
                .project(project)
                .amountPledged(amountPledged)
                .build());
    }

    // Returns the IDs of projects the current user has access to (used by milestones/expenses/dashboard scoping)
    // For funders this is still limited to projects they've FUNDED — so their dashboard only shows their portfolio
    public List<Long> getAccessibleProjectIds() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == User.Role.IMPLEMENTER) {
            return projectRepository.findByImplementer(currentUser).stream()
                    .map(Project::getId).collect(Collectors.toList());
        } else {
            return funderProjectRepository.findByFunder(currentUser).stream()
                    .map(fp -> fp.getProject().getId()).collect(Collectors.toList());
        }
    }

    public List<PublicProjectView> getAllPublicProjects() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    List<Milestone> milestones = milestoneRepository.findByProjectId(p.getId());
                    double totalSpent = milestones.stream()
                            .flatMap(m -> expenseRepository.findByMilestoneId(m.getId()).stream())
                            .mapToDouble(e -> e.getAmount().doubleValue()).sum();
                    int mDone = (int) milestones.stream()
                            .filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
                    double totalPledged = funderProjectRepository.findByProject(p).stream()
                            .mapToDouble(fp -> fp.getAmountPledged().doubleValue()).sum();
                    String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
                    return new PublicProjectView(
                            p.getId(), p.getTitle(), p.getDescription(),
                            p.getCategory(), p.getStatus().name(), p.getImageUrl(),
                            p.getTargetBudget().doubleValue(), totalPledged, totalSpent,
                            milestones.size(), mDone, createdAt,
                            List.of(), List.of()
                    );
                })
                .collect(Collectors.toList());
    }

    public PublicProjectView getPublicProjectView(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        List<Milestone> milestones = milestoneRepository.findByProjectId(id);
        List<Expense> allExpenses = milestones.stream()
                .flatMap(m -> expenseRepository.findByMilestoneId(m.getId()).stream())
                .collect(Collectors.toList());

        double totalSpent = allExpenses.stream().mapToDouble(e -> e.getAmount().doubleValue()).sum();
        int mDone = (int) milestones.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();

        List<FunderProject> pledges = funderProjectRepository.findByProject(project);
        double totalPledged = pledges.stream().mapToDouble(fp -> fp.getAmountPledged().doubleValue()).sum();

        List<PublicProjectView.MilestoneInfo> milestoneInfos = milestones.stream()
                .map(m -> new PublicProjectView.MilestoneInfo(
                        m.getId(), m.getTitle(), m.getDescription(),
                        m.getStatus().name(),
                        m.getDueDate() != null ? m.getDueDate().toString() : null,
                        m.getEvidenceImageUrl()
                ))
                .collect(Collectors.toList());

        List<PublicProjectView.FunderInfo> funderInfos = pledges.stream()
                .map(fp -> new PublicProjectView.FunderInfo(
                        fp.getFunder().getFullName(),
                        fp.getAmountPledged().doubleValue(),
                        fp.getCreatedAt() != null ? fp.getCreatedAt().toString() : null
                ))
                .collect(Collectors.toList());

        String createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
        return new PublicProjectView(
                project.getId(), project.getTitle(), project.getDescription(),
                project.getCategory(), project.getStatus().name(), project.getImageUrl(),
                project.getTargetBudget().doubleValue(), totalPledged, totalSpent,
                milestones.size(), mDone, createdAt, milestoneInfos, funderInfos
        );
    }

    private List<ProjectDto> enrichProjects(List<Project> projects, Map<Long, Double> pledgesByProjectId) {
        List<Milestone> allMilestones = milestoneRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();

        Map<Long, List<Milestone>> milestonesByProject = allMilestones.stream()
                .collect(Collectors.groupingBy(m -> m.getProject().getId()));
        Map<Long, BigDecimal> expensesByProject = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getMilestone().getProject().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        return projects.stream().map(p -> {
            List<Milestone> ms = milestonesByProject.getOrDefault(p.getId(), List.of());
            int mDone = (int) ms.stream().filter(m -> m.getStatus() == Milestone.Status.COMPLETED).count();
            double spent = expensesByProject.getOrDefault(p.getId(), BigDecimal.ZERO).doubleValue();
            String createdAt = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null;
            return new ProjectDto(p.getId(), p.getTitle(), p.getDescription(),
                    p.getCategory(), p.getStatus().name(),
                    p.getTargetBudget().doubleValue(), spent,
                    ms.size(), mDone, createdAt, createdAt,
                    pledgesByProjectId.get(p.getId()), p.getImageUrl());
        }).collect(Collectors.toList());
    }
}
