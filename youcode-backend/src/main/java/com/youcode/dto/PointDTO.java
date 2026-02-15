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
public class PointDTO {
    private Long id;
    private Long learnerId;
    private String learnerName;
    private Long activityId;
    private String activityTitle;
    private Integer points;
    private Integer maxPoints;
    private String feedback;

    // Timestamps
    private LocalDateTime createdAt;
}
