package com.sethome.sethome.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.dto.ReviewRequest;
import com.sethome.sethome.dto.ReviewResponse;
import com.sethome.sethome.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody ReviewRequest request,
            Authentication authentication
    ) {

        try {

            ReviewResponse response =
                    reviewService.createReview(
                            request,
                            authentication.getName()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }

 @GetMapping("/room/{roomId}")
public ResponseEntity<List<ReviewResponse>> getRoomReviews(
        @PathVariable Long roomId
) {
    try {
        return ResponseEntity.ok(
                reviewService.getRoomReviews(roomId)
        );
    } catch (IllegalArgumentException e) {
        return ResponseEntity.notFound().build();
    }
}

}