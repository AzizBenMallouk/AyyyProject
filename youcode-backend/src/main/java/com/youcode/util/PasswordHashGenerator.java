package com.youcode.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("Generating BCrypt hashes...");
        System.out.println("admin password hash: " + encoder.encode("admin"));
        System.out.println("trainer password hash: " + encoder.encode("trainer"));
        System.out.println("learner password hash: " + encoder.encode("learner"));
        System.out.println("password hash: " + encoder.encode("password"));
    }
}
