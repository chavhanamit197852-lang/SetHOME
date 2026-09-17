package com.sethome.sethome.service;

import org.springframework.stereotype.Service;

import com.sethome.sethome.dto.ContactRequest;
import com.sethome.sethome.model.ContactMessage;
import com.sethome.sethome.repository.ContactRepository;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public ContactMessage saveContactMessage(ContactRequest request) {

        ContactMessage contactMessage = new ContactMessage();

        contactMessage.setName(request.getName());
        contactMessage.setEmail(request.getEmail());
        contactMessage.setPhone(request.getPhone());
        contactMessage.setMessage(request.getMessage());

        return contactRepository.save(contactMessage);
    }
}