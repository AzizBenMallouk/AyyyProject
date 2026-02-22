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
public class ClassroomActivityDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private Long typeId;
    private LocalDate dueDate;
    private Integer maxPoints;
    private String assignmentType;
    private Integer duration;
    private Boolean isRecurring;
    private String recurrencePattern;
    private String resources;
    private Long sprintId;
    private Long parentActivityId;
    private LocalDateTime startDate;
    private List<Long> targetIds;

    // Related entities
    private Long classroomId;
    private String classroomName;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
