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

    // Add new room
    public Room addRoom(Room room) {

        room.setStatus(RoomStatus.PENDING);

        return roomRepository.save(room);
    }

    // Get only approved rooms
    public List<Room> getApprovedRooms() {

        return roomRepository.findByStatus(RoomStatus.APPROVED);
    }

    // Get pending rooms
    public List<Room> getPendingRooms() {

        return roomRepository.findByStatus(RoomStatus.PENDING);
    }

    // Get one room
    public Room getRoomById(Long id) {

        return roomRepository.findById(id).orElse(null);
    }

    // Approve room
    public Room approveRoom(Long id) {

        Room room = roomRepository.findById(id).orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.APPROVED);

        return roomRepository.save(room);
    }

    // Reject room
    public Room rejectRoom(Long id) {

        Room room = roomRepository.findById(id).orElse(null);

        if (room == null) {
            return null;
        }

        room.setStatus(RoomStatus.REJECTED);

        return roomRepository.save(room);
    }

    // Delete room
    public void deleteRoom(Long id) {

        roomRepository.deleteById(id);
    }
}