package com.sethome.sethome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.service.RoomService;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // PUBLIC: Add room
    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestBody Room room) {

        Room savedRoom = roomService.addRoom(room);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedRoom);
    }

    // PUBLIC: Get only APPROVED rooms
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {

        return ResponseEntity.ok(
                roomService.getApprovedRooms()
        );
    }

    // Get room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(
            @PathVariable Long id) {

        Room room = roomService.getRoomById(id);

        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(room);
    }

    // Delete room
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id) {

        Room room = roomService.getRoomById(id);

        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        roomService.deleteRoom(id);

        return ResponseEntity.noContent().build();
    }
}