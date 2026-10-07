package com.sethome.sethome.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.RoomStatus;
import com.sethome.sethome.repository.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomImageService roomImageService;

    public RoomService(
            RoomRepository roomRepository,
            RoomImageService roomImageService
    ) {
        this.roomRepository = roomRepository;
        this.roomImageService = roomImageService;
    }

    public Room addRoom(Room room) {
        room.setStatus(RoomStatus.PENDING);
        return roomRepository.save(room);
    }

    public Room createVendorRoom(
            Room room,
            String vendorEmail
    ) {
        room.setId(null);
        room.setVendorEmail(
                vendorEmail.trim().toLowerCase()
        );
        room.setStatus(RoomStatus.PENDING);
        room.setRejectionReason(null);

        return roomRepository.save(room);
    }

    public List<Room> getApprovedRooms() {
        return roomRepository.findByStatus(
                RoomStatus.APPROVED
        );
    }

    public List<Room> getPendingRooms() {
        return roomRepository.findByStatus(
                RoomStatus.PENDING
        );
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElse(null);
    }

    public List<Room> getVendorRooms(
            String vendorEmail
    ) {
        return roomRepository.findByVendorEmailIgnoreCase(
                vendorEmail.trim().toLowerCase()
        );
    }

    @Transactional
    public Room approveRoom(Long id) {

        Room room = roomRepository.findById(id)
                .orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.APPROVED);
        room.setRejectionReason(null);

        Room savedRoom = roomRepository.save(room);

        // Room and all its images become APPROVED together.
        roomImageService.approveImages(id);

        return savedRoom;
    }

    @Transactional
    public Room rejectRoom(
            Long id,
            String rejectionReason
    ) {

        Room room = roomRepository.findById(id)
                .orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.REJECTED);

        if (rejectionReason == null ||
                rejectionReason.trim().isEmpty()) {

            room.setRejectionReason(
                    "Listing rejected by admin."
            );

        } else {
            room.setRejectionReason(
                    rejectionReason.trim()
            );
        }

        Room savedRoom = roomRepository.save(room);

        // Room and all its images become REJECTED together.
        roomImageService.rejectImages(id);

        return savedRoom;
    }

    public Room rejectRoom(Long id) {
        return rejectRoom(
                id,
                "Listing rejected by admin."
        );
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}