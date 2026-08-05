package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.ProjectDto;
import com.gocelerate.gocelerate.dto.ProjectRequest;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Projects", description = "Create, retrieve, and update grant projects")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "List projects for the current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects(
            @RequestParam(required = false) Project.Status status) {
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved", projectService.getAllProjects(status)));
    }

    @Operation(summary = "Create a project")
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Project created", projectService.createProject(request)));
    }

    @Operation(summary = "Get a project by id")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Project retrieved", projectService.getProjectById(id)));
    }

    @Operation(summary = "Update project status")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProjectDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        Project.Status status = Project.Status.valueOf(body.get("status"));
        projectService.updateProjectStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", projectService.getProjectById(id)));
    }

    @Operation(summary = "Pledge funds to a project (funder only)")
    @PostMapping("/{id}/fund")
    public ResponseEntity<ApiResponse<ProjectDto>> fundProject(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amountPledged").toString());
        projectService.fundProject(id, amount);
        return ResponseEntity.ok(ApiResponse.success("Project funded successfully", projectService.getProjectById(id)));
    }
}
