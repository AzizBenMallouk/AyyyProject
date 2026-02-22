package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInterviewDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long positionId;
    private String positionTitle;
    private LocalDateTime interviewDate;
    private String status;
    private String globalComment;
    private List<SoftSkillEvaluationDTO> evaluations;
}
