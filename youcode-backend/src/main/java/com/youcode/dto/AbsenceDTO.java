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
public class AbsenceDTO {
    private Long id;
    private Long learnerId;
    private String learnerName;
    private Long classroomId;
    private Long absenceTypeId;
    private String absenceTypeName; // e.g., WHOLE_DAY, LATE
    private String absenceTypeColor; // e.g., red, orange, yellow
    private LocalDate date;
    private String reason;
    private Boolean justified;
    private String documentUrl;
    private LocalDateTime createdAt;
}
