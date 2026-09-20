package com.sethome.sethome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    List<Review> findAllByOrderByCreatedAtDesc();

    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
}