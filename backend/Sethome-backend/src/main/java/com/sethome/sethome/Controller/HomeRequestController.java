package com.sethome.sethome.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.dto.HomeRequestRequest;
import com.sethome.sethome.dto.HomeRequestResponse;
import com.sethome.sethome.model.HomeRequest;
import com.sethome.sethome.service.HomeRequestService;

@RestController
@RequestMapping("/api/user/home-requests")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class HomeRequestController {

    private final HomeRequestService homeRequestService;

    public HomeRequestController(HomeRequestService homeRequestService) {
        this.homeRequestService = homeRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody HomeRequestRequest request,
            Principal principal
    ) {
        try {
            HomeRequest created =
                    homeRequestService.createRequest(
                            request,
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    new HomeRequestResponse(created)
            );

        } catch (IllegalArgumentException error) {
            return ResponseEntity
                    .badRequest()
                    .body(java.util.Map.of(
                            "success", false,
                            "message", error.getMessage()
                    ));
        }
    }

    @GetMapping
    public ResponseEntity<List<HomeRequestResponse>> getMyRequests(
            Principal principal
    ) {
        List<HomeRequestResponse> responses =
                homeRequestService
                        .getUserRequests(principal.getName())
                        .stream()
                        .map(HomeRequestResponse::new)
                        .toList();

        return ResponseEntity.ok(responses);
    }
}