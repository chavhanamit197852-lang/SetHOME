package com.sethome.sethome.controller;

import java.io.InputStream;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sethome.sethome.service.RoomImageService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class RoomImageController {

    private final RoomImageService roomImageService;

    public RoomImageController(
            RoomImageService roomImageService
    ) {
        this.roomImageService = roomImageService;
    }

    @GetMapping("/admin/rooms/{roomId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminRoomImage(
            @PathVariable Long roomId,
            @PathVariable Long imageId
    ) {

        try {
            RoomImageService.ImageFile image =
                    roomImageService.getAdminImage(
                            roomId,
                            imageId
                    );

            InputStreamResource resource =
                    new InputStreamResource(
                            image.inputStream()
                    );

            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    image.contentType()
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline"
                    )
                    .body(resource);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}