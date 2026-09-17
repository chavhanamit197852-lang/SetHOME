package com.sethome.sethome.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.dto.ContactRequest;
import com.sethome.sethome.model.ContactMessage;
import com.sethome.sethome.service.ContactService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createContact(
            @Valid @RequestBody ContactRequest request) {

        ContactMessage savedMessage =
                contactService.saveContactMessage(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "success", true,
                        "message", "Your message has been received!",
                        "id", savedMessage.getId()
                )
        );
    }
}