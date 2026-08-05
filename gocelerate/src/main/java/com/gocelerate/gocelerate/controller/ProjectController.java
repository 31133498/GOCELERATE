package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.ProjectRequest;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Projects", description = "Create, retrieve, and update grant projects")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "List all projects", description = "Returns every project regardless of status or owner")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved", projectService.getAllProjects()));
    }

    @Operation(summary = "Create a project", description = "Creates a new project owned by the authenticated implementer")
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Project created", projectService.createProject(request)));
    }

    @Operation(summary = "Get a project by id", description = "Returns a single project by its database id")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Project retrieved", projectService.getProjectById(id)));
    }

    @Operation(summary = "Update project status", description = "Changes the project status. Pass ?status=ACTIVE, PENDING, or COMPLETED in the query string")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> updateStatus(
            @PathVariable Long id,
            @RequestParam Project.Status status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", projectService.updateProjectStatus(id, status)));
    }
}
