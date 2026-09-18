package com.sethome.sethome.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.dto.HomeRequestResponse;
import com.sethome.sethome.dto.HomeRequestStatusUpdate;
import com.sethome.sethome.model.HomeRequest;
import com.sethome.sethome.service.HomeRequestService;

@RestController
@RequestMapping("/api/admin/home-requests")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminHomeRequestController {

    private final HomeRequestService homeRequestService;

    public AdminHomeRequestController(
            HomeRequestService homeRequestService
    ) {
        this.homeRequestService = homeRequestService;
    }

    @GetMapping
    public ResponseEntity<List<HomeRequestResponse>> getAllRequests() {

        List<HomeRequestResponse> responses =
                homeRequestService
                        .getAllRequests()
                        .stream()
                        .map(HomeRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody HomeRequestStatusUpdate request
    ) {
        try {

            HomeRequest updated =
                    homeRequestService.updateStatus(
                            id,
                            request.getStatus(),
                            request.getReason()
                    );

            if (updated == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(
                    new HomeRequestResponse(updated)
            );

        } catch (IllegalArgumentException error) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", error.getMessage()
                    ));
        }
    }
}