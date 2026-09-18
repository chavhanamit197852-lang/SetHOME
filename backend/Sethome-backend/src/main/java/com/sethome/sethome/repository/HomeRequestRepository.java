package com.sethome.sethome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.HomeRequest;
import com.sethome.sethome.model.HomeRequestStatus;

public interface HomeRequestRepository
        extends JpaRepository<HomeRequest, Long> {

    List<HomeRequest> findByRenterEmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    List<HomeRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByRenterIdAndRoomIdAndStatusIn(
            Long renterId,
            Long roomId,
            List<HomeRequestStatus> statuses
    );
}