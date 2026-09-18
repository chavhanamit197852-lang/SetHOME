package com.sethome.sethome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.service.RoomService;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    private final RoomService roomService;

    public VendorController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(
            @RequestBody Room room,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            java.util.Map.of(
                                    "success", false,
                                    "message",
                                    "Vendor login required."
                            )
                    );
        }

        String vendorEmail =
                authentication.getName();

        Room created =
                roomService.createVendorRoom(
                        room,
                        vendorEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getMyRooms(
            Authentication authentication
    ) {

        String vendorEmail =
                authentication.getName();

        return ResponseEntity.ok(
                roomService.getVendorRooms(
                        vendorEmail
                )
        );
    }
}