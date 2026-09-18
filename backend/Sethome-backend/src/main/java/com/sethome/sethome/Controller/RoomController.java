package com.sethome.sethome.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    /*
     * PUBLIC:
     * Get only APPROVED rooms.
     */
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {

        return ResponseEntity.ok(
                roomService.getApprovedRooms()
        );
    }

    /*
     * PUBLIC:
     * Get one room.
     *
     * IMPORTANT:
     * Only approved rooms should be exposed
     * through the public endpoint.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(
            @PathVariable Long id
    ) {

        Room room =
                roomService.getRoomById(id);

        if (room == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        /*
         * Do not expose PENDING or REJECTED
         * rooms publicly.
         */
        if (room.getStatus() == null ||
                !room.getStatus().name().equals("APPROVED")) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(room);
    }

    /*
     * DELETE is intentionally NOT available
     * through the public RoomController.
     *
     * Room deletion will be handled through
     * authorized Vendor/Admin endpoints later.
     */
}