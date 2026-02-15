package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollDTO {
    private Long id;
    private Long learnerId;
    private String learnerName;
    private String learnerEmail;
    private Long classroomId;
    private String classroomName;
    private LocalDate enrolledAt;
    private Boolean active;
}
