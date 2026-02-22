package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramDTO {
    private Long id;
    private String title;
    private String description;
    private String speciality;
    private String groupId;
    private Integer version;
    private String status;
    private Long parentId;
    private List<ProgramDTO> history;
    private List<SprintDTO> sprints;
}
