package com.sethome.sethome.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sethome.sethome.dto.LoginRequest;
import com.sethome.sethome.dto.RegisterRequest;
import com.sethome.sethome.model.User;
import com.sethome.sethome.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    

    public AuthController(
        UserService userService,
        AuthenticationManager authenticationManager
) {
    this.userService = userService;
    this.authenticationManager = authenticationManager;
}


    // ============================================================
    // REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        try {

            User user = userService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "success", true,
                                    "message", "Account created successfully.",
                                    "user", userResponse(user)
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", e.getMessage()
                            )
                    );
        }
    }


    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
        public ResponseEntity<?> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
){

        try {

            String email =
                    request.getEmail()
                            .trim()
                            .toLowerCase();


            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    );


            Authentication authentication =
                    authenticationManager.authenticate(authToken);


            // Create a fresh SecurityContext
           SecurityContext context =
        SecurityContextHolder.createEmptyContext();

context.setAuthentication(authentication);

SecurityContextHolder.setContext(context);

HttpSession session = httpRequest.getSession(true);


            User user =
                    userService.findByEmail(email);


            if (user == null) {

                SecurityContextHolder.clearContext();

                session.invalidate();

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "success", false,
                                        "message", "User account not found."
                                )
                        );
            }


            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Login successful.",
                            "user", userResponse(user)
                    )
            );


        } catch (AuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Invalid email or password."
                            )
                    );
        }
    }


    // ============================================================
    // CURRENT LOGGED-IN USER
    // ============================================================

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Not logged in."
                            )
                    );
        }


        String email =
                authentication.getName();


        User user =
                userService.findByEmail(email);


        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "User not found."
                            )
                    );
        }


        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "user", userResponse(user)
                )
        );
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {

        SecurityContextHolder.clearContext();


        HttpSession session =
                request.getSession(false);


        if (session != null) {
            session.invalidate();
        }


        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Logged out successfully."
                )
        );
    }


    // ============================================================
    // USER RESPONSE
    // ============================================================

    private Map<String, Object> userResponse(
            User user
    ) {

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "role", user.getRole().name()
        );
    }
}