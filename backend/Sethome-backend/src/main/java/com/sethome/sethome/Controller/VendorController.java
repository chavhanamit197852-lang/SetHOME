package com.sethome.sethome.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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