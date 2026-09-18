package com.sethome.sethome.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sethome.sethome.dto.HomeRequestRequest;
import com.sethome.sethome.model.HomeRequest;
import com.sethome.sethome.model.HomeRequestStatus;
import com.sethome.sethome.model.Role;
import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.User;
import com.sethome.sethome.repository.HomeRequestRepository;
import com.sethome.sethome.repository.UserRepository;

@Service
public class HomeRequestService {

    private final HomeRequestRepository homeRequestRepository;
    private final UserRepository userRepository;
    private final RoomService roomService;

    public HomeRequestService(
            HomeRequestRepository homeRequestRepository,
            UserRepository userRepository,
            RoomService roomService
    ) {
        this.homeRequestRepository = homeRequestRepository;
        this.userRepository = userRepository;
        this.roomService = roomService;
    }


    public HomeRequest createRequest(
            HomeRequestRequest request,
            String renterEmail
    ) {

        User renter = userRepository
                .findByEmail(renterEmail)
                .orElse(null);

        if (renter == null) {
            throw new IllegalArgumentException(
                    "Renter account not found."
            );
        }

        if (renter.getRole() != Role.USER) {
            throw new IllegalArgumentException(
                    "Only renter accounts can request homes."
            );
        }

        if (request.getRoomId() == null) {
            throw new IllegalArgumentException(
                    "Room ID is required."
            );
        }

        Room room =
                roomService.getRoomById(request.getRoomId());

        if (room == null ||
                room.getStatus() == null ||
                !room.getStatus().name().equals("APPROVED")) {

            throw new IllegalArgumentException(
                    "This room is not available for requests."
            );
        }


        boolean alreadyRequested =
                homeRequestRepository
                        .existsByRenterIdAndRoomIdAndStatusIn(
                                renter.getId(),
                                room.getId(),
                                List.of(
                                        HomeRequestStatus.PENDING,
                                        HomeRequestStatus.APPROVED,
                                        HomeRequestStatus.CONTACTED
                                )
                        );

        if (alreadyRequested) {
            throw new IllegalArgumentException(
                    "You already have an active request for this room."
            );
        }


        HomeRequest homeRequest =
                new HomeRequest();

        homeRequest.setRenter(renter);
        homeRequest.setRoom(room);

        homeRequest.setName(
                request.getName()
        );

        homeRequest.setPhone(
                request.getPhone()
        );

        homeRequest.setAge(
                request.getAge()
        );

        homeRequest.setOccupation(
                request.getOccupation()
        );

        homeRequest.setQualification(
                request.getQualification()
        );

        homeRequest.setPuneDuration(
                request.getPuneDuration()
        );

        homeRequest.setMessage(
                request.getMessage()
        );

        homeRequest.setStatus(
                HomeRequestStatus.PENDING
        );

        homeRequest.setAdminReason(null);


        return homeRequestRepository.save(
                homeRequest
        );
    }


    public List<HomeRequest> getUserRequests(
            String email
    ) {

        return homeRequestRepository
                .findByRenterEmailIgnoreCaseOrderByCreatedAtDesc(
                        email
                );
    }


    public List<HomeRequest> getAllRequests() {

        return homeRequestRepository
                .findAllByOrderByCreatedAtDesc();
    }


    public HomeRequest updateStatus(
            Long id,
            HomeRequestStatus status,
            String reason
    ) {

        HomeRequest request =
                homeRequestRepository
                        .findById(id)
                        .orElse(null);

        if (request == null) {
            return null;
        }

        request.setStatus(status);

        if (reason != null &&
                !reason.trim().isEmpty()) {

            request.setAdminReason(
                    reason.trim()
            );

        } else if (
                status == HomeRequestStatus.APPROVED ||
                status == HomeRequestStatus.CONTACTED
        ) {

            request.setAdminReason(null);
        }


        return homeRequestRepository.save(
                request
        );
    }
}