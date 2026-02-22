package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private Long typeId;
    private String resources;
    private Integer durationMinutes;
    private String difficultyLevel;
    private String assignmentType;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
