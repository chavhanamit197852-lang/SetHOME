package com.sethome.sethome.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sethome.sethome.dto.RegisterRequest;
import com.sethome.sethome.model.Role;
import com.sethome.sethome.model.User;
import com.sethome.sethome.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // Register user
    // =========================

    public User register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        // Public registration is allowed only for USER or VENDOR.
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Admin accounts cannot be created through public registration."
            );
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());

        // NEVER store the raw password.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());
        user.setEnabled(true);

        return userRepository.save(user);
    }

    // =========================
    // Find user by email
    // =========================

    public User findByEmail(String email) {

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElse(null);
    }

    // =========================
    // Spring Security
    // =========================

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        ).orElseThrow(
                () -> new UsernameNotFoundException(
                        "User not found."
                )
        );
    }
}