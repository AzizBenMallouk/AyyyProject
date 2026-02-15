package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String profileImage;
    private Boolean bootcamp;
    private String speciality;
    private java.util.List<Long> studentIds; // IDs of students to enroll upon creation

    // Related entities
    private Long gradeId;
    private String gradeName;
    private Long trainerId;
    private String trainerName;
    private Long campusId;
    private String campusName;
    private Long promotionId;
    private String promotionName;
    private Long cmeId;
    private String cmeName;
    private Long delegateId;
    private String delegateName;

    // Statistics
    private Integer enrolledCount;
    private Integer activitiesCount;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
