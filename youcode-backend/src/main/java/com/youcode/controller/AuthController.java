package com.youcode.controller;

import com.youcode.dto.JwtResponse;
import com.youcode.dto.LoginRequest;
import com.youcode.dto.MessageResponse;
import com.youcode.dto.UserDTO;
import com.youcode.security.JwtTokenProvider;
import com.youcode.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            com.youcode.dto.UserDTO userDTO = userService.getUserByUsername(userDetails.getUsername())
                    .orElse(null);

            if (userDTO == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            JwtResponse response = new JwtResponse(
                    jwt,
                    userDTO.getId(),
                    userDTO.getUsername(),
                    userDTO.getEmail(),
                    userDTO.getRoleNames(),
                    userDTO.getCampusId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid username or password"));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get currently authenticated user details")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("getCurrentUser: Not authenticated");
            return ResponseEntity.status(401).body(new MessageResponse("Not authenticated"));
        }

        Object principal = authentication.getPrincipal();
        logger.info("getCurrentUser: Principal = {}", principal != null ? principal.getClass().getName() : "null");

        if (!(principal instanceof UserDetails)) {
            logger.warn("getCurrentUser: Invalid principal type");
            return ResponseEntity.status(401).body(new MessageResponse("Invalid principal type"));
        }

        UserDetails userDetails = (UserDetails) principal;
        logger.info("getCurrentUser: Fetching user details for {}", userDetails.getUsername());

        UserDTO userDTO = userService.getUserByUsername(userDetails.getUsername())
                .orElse(null);

        if (userDTO == null) {
            logger.warn("getCurrentUser: User not found for {}", userDetails.getUsername());
            return ResponseEntity.status(404).body(new MessageResponse("User not found"));
        }

        logger.info("getCurrentUser: Returning user details for {}", userDTO.getUsername());

        return ResponseEntity.ok(Map.of(
                "id", userDTO.getId(),
                "username", userDTO.getUsername(),
                "email", userDTO.getEmail(),
                "firstName", userDTO.getFirstName() != null ? userDTO.getFirstName() : "",
                "lastName", userDTO.getLastName() != null ? userDTO.getLastName() : "",
                "roles", userDTO.getRoleNames(),
                "campusId", userDTO.getCampusId()));
    }
}
