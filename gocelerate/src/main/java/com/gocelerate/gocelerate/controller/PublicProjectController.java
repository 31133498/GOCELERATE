package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.PublicProjectView;
import com.gocelerate.gocelerate.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicProjectController {

    private final ProjectService projectService;

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<PublicProjectView>> getPublicProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Project retrieved", projectService.getPublicProjectView(id)));
    }
}
