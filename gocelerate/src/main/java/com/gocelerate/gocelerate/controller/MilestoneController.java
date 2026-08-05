package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.MilestoneDto;
import com.gocelerate.gocelerate.dto.MilestoneRequest;
import com.gocelerate.gocelerate.model.Milestone;
import com.gocelerate.gocelerate.service.MilestoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Milestones", description = "Add and track milestones within a project")
@RestController
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @Operation(summary = "List all milestones", description = "Returns all milestones, optionally filtered by status")
    @GetMapping("/api/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneDto>>> getAllMilestones(
            @RequestParam(required = false) Milestone.Status status) {
        return ResponseEntity.ok(ApiResponse.success("Milestones retrieved", milestoneService.getAllMilestones(status)));
    }

    @Operation(summary = "Add a milestone to a project")
    @PostMapping("/api/projects/{id}/milestones")
    public ResponseEntity<ApiResponse<Milestone>> addMilestone(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Milestone added", milestoneService.addMilestone(id, request)));
    }

    @Operation(summary = "Get milestones for a project")
    @GetMapping("/api/projects/{id}/milestones")
    public ResponseEntity<ApiResponse<List<Milestone>>> getMilestonesForProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Milestones retrieved", milestoneService.getMilestonesForProject(id)));
    }

    @Operation(summary = "Update a milestone", description = "Updates milestone status (and optionally other fields)")
    @PutMapping("/api/milestones/{id}")
    public ResponseEntity<ApiResponse<Milestone>> updateMilestone(
            @PathVariable Long id,
            @RequestBody MilestoneRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Milestone updated",
                milestoneService.updateMilestone(id, request)));
    }
}
