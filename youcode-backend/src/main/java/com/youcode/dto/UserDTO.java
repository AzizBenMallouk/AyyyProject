package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String phone;
    private String address;
    private String profileImage;
    private String gender;
    private String cin;
    private String password;

    // Related entities
    private List<String> roleNames;
    private List<Long> roleIds;
    private String statusName;
    private Long statusId;
    private String campusName;
    private Long campusId;
    private String promotionName;
    private Long promotionId;
    private String gradeName;
    private Long gradeId;
    private String currentClassroomName;
    private Long currentClassroomId;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
