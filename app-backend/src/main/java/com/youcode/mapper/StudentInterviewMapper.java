package com.youcode.mapper;

import com.youcode.dto.StudentInterviewDTO;
import com.youcode.entity.StudentInterview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { SoftSkillEvaluationMapper.class })
public interface StudentInterviewMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "positionId", source = "position.id")
    @Mapping(target = "positionTitle", source = "position.title")
    StudentInterviewDTO toDto(StudentInterview interview);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "evaluations", ignore = true)
    StudentInterview toEntity(StudentInterviewDTO studentInterviewDTO);
}
