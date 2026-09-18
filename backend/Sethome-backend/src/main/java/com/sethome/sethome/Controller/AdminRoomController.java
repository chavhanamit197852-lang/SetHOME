package com.sethome.sethome.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.service.RoomService;

@RestController
@RequestMapping("/api/admin/rooms")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminRoomController {

    private final RoomService roomService;

    public AdminRoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // ============================================================
    // GET PENDING ROOMS
    // ============================================================

    @GetMapping("/pending")
    public ResponseEntity<List<Room>> getPendingRooms() {

        return ResponseEntity.ok(
                roomService.getPendingRooms()
        );
    }

    // ============================================================
    // APPROVE ROOM
    // ============================================================

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Room> approveRoom(
            @PathVariable Long id
    ) {

        Room room = roomService.approveRoom(id);

        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(room);
    }

    // ============================================================
    // REJECT ROOM
    // ============================================================

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Room> rejectRoom(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request
    ) {

        String reason = null;

        if (request != null) {
            reason = request.get("reason");
        }

        Room room = roomService.rejectRoom(id, reason);

        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(room);
    }
}