package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ProjectRequest;
import com.gocelerate.gocelerate.exception.ResourceNotFoundException;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.model.User;
import com.gocelerate.gocelerate.repository.ProjectRepository;
import com.gocelerate.gocelerate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // Reads the currently authenticated user from the SecurityContext.
    // JwtFilter populated this context at the start of the request.
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project createProject(ProjectRequest request) {
        User user = getCurrentUser();

        // Only implementers can create projects; funders are read-only observers.
        if (user.getRole() != User.Role.IMPLEMENTER) {
            throw new RuntimeException("Only implementers can create projects");
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .targetBudget(request.getTargetBudget())
                .category(request.getCategory())
                .implementer(user)
                .status(Project.Status.PENDING)
                .build();

        return projectRepository.save(project);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    public Project updateProjectStatus(Long id, Project.Status status) {
        Project project = getProjectById(id);
        project.setStatus(status);
        return projectRepository.save(project);
    }
}
