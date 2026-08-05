package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.MilestoneRequest;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.repository.MilestoneRepository;
import com.gocelerate.gocelerate.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public Milestone addMilestone(Long projectId, MilestoneRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Milestone milestone = Milestone.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : Milestone.Status.NOT_STARTED)
                .build();

        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestoneStatus(Long id, Milestone.Status status) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));
        milestone.setStatus(status);
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesForProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }
}
