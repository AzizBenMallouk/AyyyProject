package com.youcode.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@Builder
public class ActivityFilterDTO {
    private String type;
    private Long classroomId;
    private Long sprintId;
    private Long campusId;
    private Long promotionId;
    private Long gradeId;
    private Long programId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateTo;
}
