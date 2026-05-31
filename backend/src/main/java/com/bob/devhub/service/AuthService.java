package com.bob.devhub.service;

import com.bob.devhub.dto.AuthResponse;
import com.bob.devhub.dto.LoginRequest;
import com.bob.devhub.dto.RegisterRequest;
import com.bob.devhub.model.User;
import com.bob.devhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = userRepo.save(User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .build());
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), jwtService.extractExpiration(token));
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        User user = userRepo.findByUsername(req.username()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), jwtService.extractExpiration(token));
    }
}
