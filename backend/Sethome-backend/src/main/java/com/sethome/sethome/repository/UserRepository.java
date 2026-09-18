package com.sethome.sethome.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}