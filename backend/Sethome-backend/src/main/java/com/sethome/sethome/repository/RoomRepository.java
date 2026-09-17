package com.sethome.sethome.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.Room;
import com.sethome.sethome.model.RoomStatus;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatus(RoomStatus status);
}