package com.youcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SquadDTO {
    private Long id;
    private String name;
    private String description;
    private Long classroomId;
    private Long sprintId;
    private java.util.List<Long> memberIds;
    private Long scrumMasterId;
    private String scrumMasterName;
}
