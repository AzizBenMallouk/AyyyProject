-- Seed test users for YouCode application
-- Roles should already exist from Flyway migrations

-- Insert a test admin user
-- Username: admin, Password: admin
INSERT INTO users (username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
('admin', 'Admin User', 'admin@youcode.ma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 1, NOW(), NOW());

-- Insert a test trainer user  
-- Username: trainer, Password: trainer
INSERT INTO users (username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
('trainer', 'Trainer User', 'trainer@youcode.ma', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWfa7v2Lm1/ey', 'Trainer', 'User', 2, NOW(), NOW());

-- Insert a test learner user
-- Username: learner, Password: learner  
INSERT INTO users (username, name, email, password, first_name, last_name, role_id, created_at, updated_at) VALUES
('learner', 'Learner User', 'learner@youcode.ma', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWfa7v2Lm1/ey', 'Learner', 'User', 3, NOW(), NOW());
