package com.sethome.sethome.dto;

import java.time.LocalDateTime;

import com.sethome.sethome.model.Review;

public class ReviewResponse {

    final private Long id;
    final private Long roomId;
    final private String reviewerName;
    final private Integer rating;
    final private String comment;
    final private LocalDateTime createdAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.roomId = review.getRoom().getId();
        this.reviewerName = review.getUser().getName();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}