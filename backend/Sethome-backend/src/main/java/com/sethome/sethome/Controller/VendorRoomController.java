package com.sethome.sethome.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.service.RoomImageService;

@RestController
@RequestMapping("/api/vendor/rooms")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class VendorRoomController {

    private final RoomImageService roomImageService;

    public VendorRoomController(
            RoomImageService roomImageService
    ) {
        this.roomImageService = roomImageService;
    }

    @PostMapping(
            value = "/with-images",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> createRoomWithImages(
            @RequestPart("room") Room room,
            @RequestPart("files") List<MultipartFile> files,
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Vendor login required."
                    ));
        }

        try {

            String vendorEmail =
                    authentication.getName();

            Room createdRoom =
                    roomImageService.createRoomWithImages(
                            room,
                            vendorEmail,
                            files
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message",
                            "Listing submitted for admin approval.",
                            "roomId",
                            createdRoom.getId()
                    ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Listing submission failed."
                    ));
        }
    }
}