package com.sethome.sethome.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sethome.sethome.model.ImageStatus;
import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.RoomImage;
import com.sethome.sethome.model.RoomStatus;
import com.sethome.sethome.repository.RoomImageRepository;
import com.sethome.sethome.repository.RoomRepository;

@Service
public class RoomImageService {

    private static final int MAX_IMAGES_PER_ROOM = 10;

    private static final long MAX_FILE_SIZE =
            20L * 1024L * 1024L;

    private final RoomImageRepository roomImageRepository;
    private final RoomRepository roomRepository;
    private final StorageService storageService;


    

    public RoomImageService(
            RoomImageRepository roomImageRepository,
            RoomRepository roomRepository,
            StorageService storageService
    ) {
        this.roomImageRepository = roomImageRepository;
        this.roomRepository = roomRepository;
        this.storageService = storageService;
    }

    /*
     * Creates the room and uploads its images as one vendor submission.
     *
     * Room = PENDING
     * Images = PENDING
     */
    @Transactional
    public Room createRoomWithImages(
            Room room,
            String vendorEmail,
            List<MultipartFile> files
    ) throws Exception {

        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one property image is required."
            );
        }

        if (files.size() > MAX_IMAGES_PER_ROOM) {
            throw new IllegalArgumentException(
                    "A room can have a maximum of 10 images."
            );
        }

        String normalizedVendorEmail =
                vendorEmail.trim().toLowerCase();

        // Never trust ID/status/vendorEmail sent by frontend.
        room.setId(null);
        room.setVendorEmail(normalizedVendorEmail);
        room.setStatus(RoomStatus.PENDING);
        room.setRejectionReason(null);

        // Do not accept images supplied inside JSON.
        room.setImages(new ArrayList<>());

        Room savedRoom =
                roomRepository.save(room);

        List<String> uploadedKeys =
                new ArrayList<>();

        try {

            int displayOrder = 0;

            for (MultipartFile file : files) {

                validateFile(file);

                String originalFilename =
                        file.getOriginalFilename();

                String extension =
                        getExtension(originalFilename);

                String storageKey =
                        "rooms/"
                                + savedRoom.getId()
                                + "/"
                                + UUID.randomUUID()
                                + extension;

                try (InputStream inputStream =
                             file.getInputStream()) {

                    storageService.upload(
                            storageKey,
                            inputStream,
                            file.getSize(),
                            file.getContentType()
                    );
                }

                uploadedKeys.add(storageKey);

                RoomImage image =
                        new RoomImage();

                image.setRoom(savedRoom);
                image.setStorageKey(storageKey);

                image.setOriginalFilename(
                        originalFilename != null
                                ? originalFilename
                                : "image"
                );

                image.setContentType(
                        file.getContentType()
                );

                image.setFileSize(
                        file.getSize()
                );

                image.setDisplayOrder(
                        displayOrder++
                );

                image.setStatus(
                        ImageStatus.PENDING
                );

                roomImageRepository.save(image);
            }

            return savedRoom;

        } catch (Exception e) {

            /*
             * Database transaction rollback handles
             * database records.
             *
             * SeaweedFS objects need explicit cleanup.
             */
            for (String key : uploadedKeys) {
                try {
                    storageService.delete(key);
                } catch (Exception ignored) {
                    // Keep original exception.
                }
            }

            throw e;
        }
    }

    /*
     * Existing method retained for internal compatibility.
     * It is no longer the normal vendor listing flow.
     */
    public List<RoomImage> uploadImages(
            Long roomId,
            String vendorEmail,
            List<MultipartFile> files
    ) throws Exception {

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        String normalizedVendorEmail =
                vendorEmail.trim().toLowerCase();

        if (room.getVendorEmail() == null
                || !room.getVendorEmail()
                        .trim()
                        .equalsIgnoreCase(
                                normalizedVendorEmail
                        )) {

            throw new IllegalArgumentException(
                    "You are not allowed to modify this room."
            );
        }

        if (room.getStatus() != RoomStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Images can only be submitted while the listing is pending."
            );
        }

        List<RoomImage> existingImages =
                roomImageRepository
                        .findByRoomIdOrderByDisplayOrderAsc(
                                roomId
                        );

        if (existingImages.size() + files.size()
                > MAX_IMAGES_PER_ROOM) {

            throw new IllegalArgumentException(
                    "A room can have a maximum of 10 images."
            );
        }

        List<RoomImage> savedImages =
                new ArrayList<>();

        List<String> uploadedKeys =
                new ArrayList<>();

        try {

            int displayOrder =
                    existingImages.size();

            for (MultipartFile file : files) {

                validateFile(file);

                String originalFilename =
                        file.getOriginalFilename();

                String extension =
                        getExtension(originalFilename);

                String storageKey =
                        "rooms/"
                                + roomId
                                + "/"
                                + UUID.randomUUID()
                                + extension;

                try (InputStream inputStream =
                             file.getInputStream()) {

                    storageService.upload(
                            storageKey,
                            inputStream,
                            file.getSize(),
                            file.getContentType()
                    );
                }

                uploadedKeys.add(storageKey);

                RoomImage image =
                        new RoomImage();

                image.setRoom(room);
                image.setStorageKey(storageKey);

                image.setOriginalFilename(
                        originalFilename != null
                                ? originalFilename
                                : "image"
                );

                image.setContentType(
                        file.getContentType()
                );

                image.setFileSize(
                        file.getSize()
                );

                image.setDisplayOrder(
                        displayOrder++
                );

                image.setStatus(
                        ImageStatus.PENDING
                );

                savedImages.add(
                        roomImageRepository.save(image)
                );
            }

            return savedImages;

        } catch (Exception e) {

            for (String key : uploadedKeys) {
                try {
                    storageService.delete(key);
                } catch (Exception ignored) {
                    // Keep original exception.
                }
            }

            throw e;
        }
    }

    public List<RoomImage> getApprovedImages(
            Long roomId
    ) {

        return roomImageRepository
                .findByRoomIdAndStatusOrderByDisplayOrderAsc(
                        roomId,
                        ImageStatus.APPROVED
                );
    }

    public List<RoomImage> getRoomImages(
            Long roomId
    ) {

        return roomImageRepository
                .findByRoomIdOrderByDisplayOrderAsc(
                        roomId
                );
    }

    public InputStream getImageStream(
            Long roomId,
            Long imageId
    ) throws Exception {

        RoomImage image =
                roomImageRepository.findById(imageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Image not found."
                                )
                        );

        if (!image.getRoom()
                .getId()
                .equals(roomId)) {

            throw new IllegalArgumentException(
                    "Image does not belong to this room."
            );
        }

        if (image.getRoom().getStatus()
                != RoomStatus.APPROVED) {

            throw new IllegalArgumentException(
                    "Room is not approved."
            );
        }

        if (image.getStatus()
                != ImageStatus.APPROVED) {

            throw new IllegalArgumentException(
                    "Image is not approved."
            );
        }

        return storageService.download(
                image.getStorageKey()
        );
    }

    public void approveImages(Long roomId) {

        List<RoomImage> images =
                roomImageRepository
                        .findByRoomIdOrderByDisplayOrderAsc(
                                roomId
                        );

        for (RoomImage image : images) {
            image.setStatus(
                    ImageStatus.APPROVED
            );
        }

        roomImageRepository.saveAll(images);
    }

    public void rejectImages(Long roomId) {

        List<RoomImage> images =
                roomImageRepository
                        .findByRoomIdOrderByDisplayOrderAsc(
                                roomId
                        );

        for (RoomImage image : images) {
            image.setStatus(
                    ImageStatus.REJECTED
            );
        }

        roomImageRepository.saveAll(images);
    }

    private void validateFile(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Image file cannot be empty."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "Each image must be 20 MB or smaller."
            );
        }

        String contentType =
                file.getContentType();

        if (!"image/jpeg"
                .equalsIgnoreCase(contentType)
                && !"image/png"
                .equalsIgnoreCase(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, JPEG and PNG images are allowed."
            );
        }
    }

    private String getExtension(
            String filename
    ) {

        if (filename == null) {
            return ".jpg";
        }

        String lower =
                filename.toLowerCase();

        if (lower.endsWith(".png")) {
            return ".png";
        }

        return ".jpg";
    }

    public ImageFile getAdminImage(
        Long roomId,
        Long imageId
) {

    Room room = roomRepository.findById(roomId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Room not found."
                    )
            );

    RoomImage image = roomImageRepository
            .findById(imageId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Image not found."
                    )
            );

    if (image.getRoom() == null ||
            !image.getRoom().getId().equals(room.getId())) {

        throw new IllegalArgumentException(
                "Image does not belong to this room."
        );
    }

    /*
     * Admin must be able to inspect images
     * before room approval.
     *
     * Therefore PENDING and REJECTED images
     * can be previewed here.
     */
    try {

        InputStream inputStream =
                storageService.download(
                        image.getStorageKey()
                );

        return new ImageFile(
                inputStream,
                image.getContentType()
        );

    } catch (Exception e) {

        throw new IllegalArgumentException(
                "Unable to load image."
        );
    }
}
public record ImageFile(
        InputStream inputStream,
        String contentType
) {}
}