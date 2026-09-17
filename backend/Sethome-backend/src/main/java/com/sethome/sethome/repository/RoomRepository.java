package com.sethome.sethome.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}