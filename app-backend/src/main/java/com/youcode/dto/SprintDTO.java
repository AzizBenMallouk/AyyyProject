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
public class SprintDTO {
    private Long id;
    private String title;
    private String objective;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long programId;
    private String technologies;
}
