package com.sethome.sethome.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.sethome.sethome.service.UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    // ==========================================
    // Password Encoder
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // ==========================================
    // Authentication Provider
    // ==========================================

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserService userService,
            PasswordEncoder passwordEncoder
    ) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }


    // ==========================================
    // Authentication Manager
    // ==========================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationProvider authenticationProvider
    ) {

        return new ProviderManager(
                authenticationProvider
        );
    }


    // ==========================================
    // Security Context Repository
    // ==========================================

    @Bean
    public SecurityContextRepository securityContextRepository() {

        return new HttpSessionSecurityContextRepository();
    }


    // ==========================================
    // Security Filter Chain
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider,
            SecurityContextRepository securityContextRepository
    ) throws Exception {

        http

                // ==================================
                // CORS
                // ==================================

                .cors(cors -> cors
                        .configurationSource(
                                corsConfigurationSource()
                        )
                )


                // ==================================
                // CSRF
                // ==================================

                .csrf(csrf -> csrf.disable())


                // ==================================
                // Security Context
                // ==================================

                .securityContext(securityContext -> securityContext
        .securityContextRepository(
                securityContextRepository
        )
        .requireExplicitSave(false)
)


                // ==================================
                // Session
                // ==================================

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )


                // ==================================
                // Authentication Provider
                // ==================================

                .authenticationProvider(
                        authenticationProvider
                )


                // ==================================
                // Authorization
                // ==================================

                .authorizeHttpRequests(auth -> auth

                        // --------------------------------
                        // Public endpoints
                        // --------------------------------

        .requestMatchers(
                "/",
                "/error",
                "/api/auth/**",
                "/api/contact"
        ).permitAll()

        // Public room browsing
        .requestMatchers(
                org.springframework.http.HttpMethod.GET,
                "/api/rooms",
                "/api/rooms/**"
        ).permitAll()

        // Admin
        .requestMatchers(
                "/api/admin/**"
        ).hasRole("ADMIN")

        // Vendor
        .requestMatchers(
                "/api/vendor/**"
        ).hasRole("VENDOR")

        // Renter
        .requestMatchers(
                "/api/user/**"
        ).hasRole("USER")


                        // --------------------------------
                        // Everything else
                        // --------------------------------

                        .anyRequest().authenticated()
                );


        return http.build();
    }


    // ==========================================
    // CORS Configuration
    // ==========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5500",
                        "http://127.0.0.1:5500"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}