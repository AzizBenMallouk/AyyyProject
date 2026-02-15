package com.youcode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermission extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    /**
     * true = ALLOW (overrides role denial if any, or adds to role permissions)
     * false = DENY (overrides role allowance)
     */
    @Column(name = "is_granted", nullable = false)
    private boolean isGranted;
}
