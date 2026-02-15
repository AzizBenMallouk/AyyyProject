-- Seed data for YouCode application
-- This script creates initial roles and users for testing

-- Insert Roles
INSERT INTO roles (id, name, created_at, updated_at) VALUES
(1, 'ADMIN', NOW(), NOW()),
(2, 'TRAINER', NOW(), NOW()),
(3, 'LEARNER', NOW(), NOW());

-- Insert a test admin user
-- Password: admin (BCrypt encoded)
INSERT INTO users (id, username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
(1, 'admin', 'Admin User', 'admin@youcode.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 1, NOW(), NOW());

-- Insert a test trainer user  
-- Password: trainer
INSERT INTO users (id, username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
(2, 'trainer', 'Trainer User', 'trainer@youcode.ma', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWfa7v2Lm1/ey', 'Trainer', 'User', 2, NOW(), NOW());

-- Insert a test learner user
-- Password: learner  
INSERT INTO users (id, username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
(3, 'learner', 'Learner User', 'learner@youcode.ma', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWfa7v2Lm1/ey', 'Learner', 'User', 3, NOW(), NOW());
