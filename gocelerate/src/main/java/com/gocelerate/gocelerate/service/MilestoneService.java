package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.MilestoneDto;
import com.gocelerate.gocelerate.dto.MilestoneRequest;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final ExpenseRepository expenseRepository;
    private final ProjectService projectService;

    public Milestone addMilestone(Long projectId, MilestoneRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        Milestone milestone = Milestone.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .evidenceImageUrl(request.getEvidenceImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : Milestone.Status.NOT_STARTED)
                .build();
        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestone(Long id, MilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));
        if (request.getStatus() != null) {
            milestone.setStatus(request.getStatus());
        }
        if (request.getEvidenceImageUrl() != null) {
            milestone.setEvidenceImageUrl(request.getEvidenceImageUrl());
        }
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesForProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    public List<MilestoneDto> getAllMilestones(Milestone.Status status) {
        List<Long> accessibleProjectIds = projectService.getAccessibleProjectIds();

        List<Milestone> milestones = (status != null
                ? milestoneRepository.findByStatus(status)
                : milestoneRepository.findAll()).stream()
                .filter(m -> accessibleProjectIds.contains(m.getProject().getId()))
                .collect(Collectors.toList());

        List<Expense> allExpenses = expenseRepository.findAll();
        Map<Long, BigDecimal> expensesByMilestone = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getMilestone().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        return milestones.stream()
                .map(m -> new MilestoneDto(
                        m.getId(),
                        m.getProject().getId(),
                        m.getProject().getTitle(),
                        m.getTitle(),
                        m.getDescription(),
                        m.getStatus().name(),
                        m.getDueDate() != null ? m.getDueDate().toString() : null,
                        expensesByMilestone.getOrDefault(m.getId(), BigDecimal.ZERO).doubleValue(),
                        m.getCreatedAt() != null ? m.getCreatedAt().toString() : null,
                        m.getEvidenceImageUrl()
                ))
                .collect(Collectors.toList());
    }
}
