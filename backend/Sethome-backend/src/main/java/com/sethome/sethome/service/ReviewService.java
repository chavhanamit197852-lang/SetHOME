package com.sethome.sethome.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sethome.sethome.dto.ReviewRequest;
import com.sethome.sethome.dto.ReviewResponse;
import com.sethome.sethome.model.Review;
import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.User;
import com.sethome.sethome.repository.ReviewRepository;
import com.sethome.sethome.repository.RoomRepository;
import com.sethome.sethome.repository.UserRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            RoomRepository roomRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(
            ReviewRequest request,
            String userEmail
    ) {

        if (request == null) {
            throw new IllegalArgumentException("Review data is required.");
        }

        if (request.getRoomId() == null) {
            throw new IllegalArgumentException("Room ID is required.");
        }

        if (request.getRating() == null ||
                request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5."
            );
        }

        if (request.getComment() == null ||
                request.getComment().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Review comment is required."
            );
        }

        String comment = request.getComment().trim();

        if (comment.length() > 1000) {
            throw new IllegalArgumentException(
                    "Review comment cannot exceed 1000 characters."
            );
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account not found."
                        )
                );

        if (user.getRole() == null ||
                !user.getRole().name().equals("USER")) {

            throw new IllegalArgumentException(
                    "Only renters can submit reviews."
            );
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Room not found."
                        )
                );

        if (room.getStatus() == null ||
                !room.getStatus().name().equals("APPROVED")) {

            throw new IllegalArgumentException(
                    "Reviews can only be submitted for approved rooms."
            );
        }

        if (reviewRepository.existsByUserIdAndRoomId(
                user.getId(),
                room.getId()
        )) {

            throw new IllegalArgumentException(
                    "You have already reviewed this room."
            );
        }

        Review review = new Review();

        review.setUser(user);
        review.setRoom(room);
        review.setRating(request.getRating());
        review.setComment(comment);

        Review saved = reviewRepository.save(review);

        return new ReviewResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getRoomReviews(Long roomId) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Room not found."
                        )
                );

        if (room.getStatus() == null ||
                !room.getStatus().name().equals("APPROVED")) {

            throw new IllegalArgumentException(
                    "Reviews are not available for this room."
            );
        }

        return reviewRepository
                .findByRoomIdOrderByCreatedAtDesc(roomId)
                .stream()
                .map(ReviewResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {

        return reviewRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReviewResponse::new)
                .toList();
    }

    public boolean deleteReview(Long reviewId) {

        if (!reviewRepository.existsById(reviewId)) {
            return false;
        }

        reviewRepository.deleteById(reviewId);

        return true;
    }

}