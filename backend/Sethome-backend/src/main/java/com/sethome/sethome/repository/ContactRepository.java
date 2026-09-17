package com.sethome.sethome.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sethome.sethome.model.ContactMessage;

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
}