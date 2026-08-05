package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.ProjectReport;
import com.gocelerate.gocelerate.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reports", description = "Generate project summary reports. All budget and spend values are in Nigerian Naira (NGN).")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(
        summary = "Generate a project report",
        description = "Returns a full summary including total spend, category breakdown, milestone statuses, and completion percentage. All monetary values are in Naira (NGN)."
    )
    @GetMapping("/{id}/report")
    public ResponseEntity<ApiResponse<ProjectReport>> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Report generated", reportService.generateReport(id)));
    }
}
