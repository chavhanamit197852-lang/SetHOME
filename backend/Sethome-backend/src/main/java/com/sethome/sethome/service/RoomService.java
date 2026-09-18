package com.sethome.sethome.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.RoomStatus;
import com.sethome.sethome.repository.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Existing generic room creation
    public Room addRoom(Room room) {

        room.setStatus(RoomStatus.PENDING);

        return roomRepository.save(room);
    }

    // Vendor creates a new listing
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

    // Public website: approved rooms only
    public List<Room> getApprovedRooms() {

        return roomRepository.findByStatus(
                RoomStatus.APPROVED
        );
    }

    // Admin: pending rooms
    public List<Room> getPendingRooms() {

        return roomRepository.findByStatus(
                RoomStatus.PENDING
        );
    }

    // Get one room
    public Room getRoomById(Long id) {

        return roomRepository.findById(id)
                .orElse(null);
    }

    // Vendor: get only own rooms
    public List<Room> getVendorRooms(
            String vendorEmail
    ) {

        return roomRepository.findByVendorEmailIgnoreCase(
                vendorEmail.trim().toLowerCase()
        );
    }

    // Approve room
    public Room approveRoom(Long id) {

        Room room =
                roomRepository.findById(id)
                        .orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.APPROVED);
        room.setRejectionReason(null);

        return roomRepository.save(room);
    }

    // Reject room
    public Room rejectRoom(
            Long id,
            String rejectionReason
    ) {

        Room room =
                roomRepository.findById(id)
                        .orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.REJECTED);

        room.setRejectionReason(
                rejectionReason
        );

        return roomRepository.save(room);
    }

    // Existing simple reject method
    public Room rejectRoom(Long id) {

        return rejectRoom(
                id,
                "Listing rejected by admin."
        );
    }

    // Delete room
    public void deleteRoom(Long id) {

        roomRepository.deleteById(id);
    }
}