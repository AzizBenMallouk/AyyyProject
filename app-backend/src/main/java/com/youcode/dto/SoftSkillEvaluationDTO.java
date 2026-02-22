package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoftSkillEvaluationDTO {
    private Long id;
    private Long interviewId;
    private Long softSkillId;
    private String softSkillName;
    private Integer score;
    private String comment;
}
