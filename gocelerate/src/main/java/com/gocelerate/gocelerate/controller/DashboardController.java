package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.DashboardStatsDto;
import com.gocelerate.gocelerate.dto.FunderDashboardDto;
import com.gocelerate.gocelerate.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Aggregated stats for the dashboard")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get implementer dashboard stats")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", dashboardService.getStats()));
    }

    @Operation(summary = "Get funder portfolio dashboard stats")
    @GetMapping("/funder-stats")
    public ResponseEntity<ApiResponse<FunderDashboardDto>> getFunderStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", dashboardService.getFunderStats()));
    }
}
