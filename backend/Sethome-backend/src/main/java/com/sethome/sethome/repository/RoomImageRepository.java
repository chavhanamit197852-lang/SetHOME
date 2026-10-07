package com.sethome.sethome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.ImageStatus;
import com.sethome.sethome.model.RoomImage;

public interface RoomImageRepository
        extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderByDisplayOrderAsc(
            Long roomId
    );

    List<RoomImage> findByRoomIdAndStatusOrderByDisplayOrderAsc(
            Long roomId,
            ImageStatus status
    );
}