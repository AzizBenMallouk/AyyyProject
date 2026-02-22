package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import com.youcode.entity.UserPermission;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String username;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String phone;

    private String address;

    @Column(name = "profile_image")
    private String profileImage;

    private String gender;

    @Column(name = "cin")
    private String cin;

    @Column(name = "email_verified_at")
    private LocalDate emailVerifiedAt;

    @Column(name = "remember_token")
    private String rememberToken;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "status_id")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "campus_id")
    private Campus campus;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne
    @JoinColumn(name = "current_classroom_id")
    private Classroom currentClassroom;

    @ManyToOne
    @JoinColumn(name = "original_city_id")
    private City originalCity;

    @ManyToOne
    @JoinColumn(name = "birth_city_id")
    private City birthCity;

    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Enroll> enrolls = new HashSet<>();

    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Absence> absences = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<LinkBrand> linkBrands = new HashSet<>();

    @OneToMany(mappedBy = "learner", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Point> points = new HashSet<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<MarketplaceOrder> marketOrders = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<UserPermission> permissions = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<UserStatus> statusHistory = new HashSet<>();

    public boolean hasPermission(String permissionName) {
        // 1. Check direct USER permissions (overrides)
        for (UserPermission up : permissions) {
            if (up.getPermission().getName().equalsIgnoreCase(permissionName)) {
                return up.isGranted(); // Explicit ALLOW or DENY
            }
        }

        // 2. Fallback to ROLE permissions
        return roles.stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(p -> p.getName().equalsIgnoreCase(permissionName));
    }

    public boolean isAdmin() {
        return roles.stream().anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName()));
    }

    public boolean isStaff() {
        return roles.stream().anyMatch(role -> "STAFF".equalsIgnoreCase(role.getName()));
    }

    public boolean isLearner() {
        return roles.stream().anyMatch(role -> "LEARNER".equalsIgnoreCase(role.getName()));
    }
}
