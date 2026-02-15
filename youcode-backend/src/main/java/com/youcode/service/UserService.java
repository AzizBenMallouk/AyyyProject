package com.youcode.service;

import com.youcode.dto.UserDTO;
import com.youcode.entity.Role;
import com.youcode.entity.User;
import com.youcode.entity.Status;
import com.youcode.repository.RoleRepository;
import com.youcode.repository.UserRepository;
import com.youcode.repository.StatusRepository;
import lombok.RequiredArgsConstructor;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * Create a new user
     */
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setName(userDTO.getFirstName() + " " + userDTO.getLastName());

        // Set other fields if present
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        user.setGender(userDTO.getGender());
        user.setBirthDate(userDTO.getBirthDate());
        user.setCin(userDTO.getCin());

        // Set Roles
        Set<Role> roles = new HashSet<>();
        if (userDTO.getRoleNames() != null && !userDTO.getRoleNames().isEmpty()) {
            for (String roleName : userDTO.getRoleNames()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
                roles.add(role);
            }
        } else {
            // Default role if none provided
            Role learnerRole = roleRepository.findByName("LEARNER")
                    .orElseThrow(() -> new RuntimeException("Default role 'LEARNER' not found."));
            roles.add(learnerRole);
        }
        user.setRoles(roles);

        // Set Default Status to ACTIVE
        Status status = statusRepository.findByName("ACTIVE")
                .orElseThrow(() -> new RuntimeException("Default status 'ACTIVE' not found."));
        user.setStatus(status);

        User savedUser = userRepository.save(user);
        log.info("Created user: {}", savedUser.getUsername());

        return convertToDTO(savedUser);
    }

    /**
     * Get all users with pagination
     */
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    /**
     * Get user by ID
     */
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    /**
     * Get user by username
     */
    public Optional<UserDTO> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::convertToDTO);
    }

    /**
     * Search users by name or email
     */
    public List<UserDTO> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get users by role
     */
    public List<UserDTO> getUsersByRole(String roleName) {
        return userRepository.findByRoles_Name(roleName)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get filtered learners
     */
    public Page<UserDTO> getFilteredLearners(Long gradeId, Long promotionId, Long campusId, Long classroomId,
            String statusName, String query, Pageable pageable) {
        Specification<User> spec = (root, q, cb) -> {
            // Use distinct to avoid duplicates due to joins
            q.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // Rule: Always filter by LEARNER role
            predicates.add(cb.equal(root.join("roles").get("name"), "LEARNER"));

            if (gradeId != null) {
                predicates.add(cb.equal(root.join("enrolls", JoinType.LEFT)
                        .join("classroom", JoinType.LEFT)
                        .join("grade", JoinType.LEFT).get("id"), gradeId));
            }
            if (promotionId != null) {
                predicates.add(cb.equal(root.get("promotion").get("id"), promotionId));
            }
            if (campusId != null) {
                predicates.add(cb.equal(root.get("campus").get("id"), campusId));
            }
            if (classroomId != null) {
                predicates.add(cb.equal(root.join("enrolls", JoinType.LEFT)
                        .join("classroom", JoinType.LEFT).get("id"), classroomId));
            }
            if (statusName != null && !statusName.isEmpty()) {
                predicates.add(cb.equal(root.get("status").get("name"), statusName));
            }
            if (query != null && !query.isEmpty()) {
                String search = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), search),
                        cb.like(cb.lower(root.get("email")), search),
                        cb.like(cb.lower(root.get("phone")), search),
                        cb.like(cb.lower(root.get("cin")), search)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(this::convertToDTO);

    }

    /**
     * Get filtered users
     */
    public Page<UserDTO> getFilteredUsers(String roleName, Long gradeId, Long promotionId, Long campusId,
            String statusName, String query, Pageable pageable) {
        Specification<User> spec = (root, q, cb) -> {
            q.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            if (roleName != null && !roleName.isEmpty()) {
                predicates.add(cb.equal(root.join("roles").get("name"), roleName));
            }
            if (gradeId != null) {
                predicates.add(cb.equal(root.join("enrolls", JoinType.LEFT)
                        .join("classroom", JoinType.LEFT)
                        .join("grade", JoinType.LEFT).get("id"), gradeId));
            }
            if (promotionId != null) {
                predicates.add(cb.equal(root.get("promotion").get("id"), promotionId));
            }
            if (campusId != null) {
                predicates.add(cb.equal(root.get("campus").get("id"), campusId));
            }
            if (statusName != null && !statusName.isEmpty()) {
                predicates.add(cb.equal(root.get("status").get("name"), statusName));
            }
            if (query != null && !query.isEmpty()) {
                String search = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), search),
                        cb.like(cb.lower(root.get("email")), search),
                        cb.like(cb.lower(root.get("phone")), search),
                        cb.like(cb.lower(root.get("username")), search),
                        cb.like(cb.lower(root.get("cin")), search)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Update user
     */
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Update fields
        if (userDTO.getName() != null)
            user.setName(userDTO.getName());
        if (userDTO.getFirstName() != null)
            user.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null)
            user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null)
            user.setEmail(userDTO.getEmail());
        if (userDTO.getPhone() != null)
            user.setPhone(userDTO.getPhone());
        if (userDTO.getAddress() != null)
            user.setAddress(userDTO.getAddress());
        if (userDTO.getGender() != null)
            user.setGender(userDTO.getGender());
        if (userDTO.getBirthDate() != null)
            user.setBirthDate(userDTO.getBirthDate());
        if (userDTO.getCin() != null)
            user.setCin(userDTO.getCin());

        // Update Roles
        if (userDTO.getRoleNames() != null && !userDTO.getRoleNames().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : userDTO.getRoleNames()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated user: {}", savedUser.getUsername());

        return convertToDTO(savedUser);
    }

    /**
     * Update user status
     */
    /**
     * Update user status with history
     */
    public UserDTO updateUserStatus(Long id, String statusName, java.time.LocalDate date, String description) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        Status status = statusRepository.findByName(statusName)
                .orElseThrow(() -> new RuntimeException("Status not found: " + statusName));

        // Create Status History
        com.youcode.entity.UserStatus history = com.youcode.entity.UserStatus.builder()
                .user(user)
                .status(status)
                .date(date != null ? date : java.time.LocalDate.now())
                .description(description)
                .build();

        // Ensure the set is initialized (lombok builder default might need attention if
        // not set)
        if (user.getStatusHistory() == null) {
            user.setStatusHistory(new HashSet<>());
        }
        user.getStatusHistory().add(history);

        // Update current status for quick access
        user.setStatus(status);

        User savedUser = userRepository.save(user);
        log.info("Updated user status: {} -> {}", user.getUsername(), statusName);

        return convertToDTO(savedUser);
    }

    /**
     * Delete user
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        userRepository.delete(user);
        log.info("Deleted user: {}", user.getUsername());
    }

    /**
     * Get total user count
     */
    public long getTotalUserCount() {
        return userRepository.count();
    }

    /**
     * Get user count by role
     */
    public long getUserCountByRole(String roleName) {
        return userRepository.countByRoles_Name(roleName);
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthDate(user.getBirthDate())
                .phone(user.getPhone())
                .address(user.getAddress())
                .profileImage(user.getProfileImage())
                .gender(user.getGender())
                .cin(user.getCin())
                .roleNames(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .roleIds(user.getRoles().stream().map(Role::getId).collect(Collectors.toList()))
                .statusName(user.getStatus() != null ? user.getStatus().getName() : null)
                .statusId(user.getStatus() != null ? user.getStatus().getId() : null)
                .campusName(user.getCampus() != null ? user.getCampus().getName() : null)
                .campusId(user.getCampus() != null ? user.getCampus().getId() : null)
                .promotionName(user.getPromotion() != null ? user.getPromotion().getName() : null)
                .promotionId(user.getPromotion() != null ? user.getPromotion().getId() : null)
                .gradeName(user.getCurrentClassroom() != null ? user.getCurrentClassroom().getGrade().getName() : null)
                .gradeId(user.getCurrentClassroom() != null ? user.getCurrentClassroom().getGrade().getId() : null)
                .currentClassroomName(user.getCurrentClassroom() != null ? user.getCurrentClassroom().getName() : null)
                .currentClassroomId(user.getCurrentClassroom() != null ? user.getCurrentClassroom().getId() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
