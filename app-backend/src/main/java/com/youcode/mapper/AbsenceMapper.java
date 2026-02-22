package com.youcode.mapper;

import com.youcode.dto.AbsenceDTO;
import com.youcode.entity.Absence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AbsenceMapper {

    @Mapping(target = "learnerId", source = "learner.id")
    @Mapping(target = "learnerName", source = "learner.name")
    @Mapping(target = "classroomId", source = "classroom.id")
    @Mapping(target = "absenceTypeId", source = "absenceType.id")
    @Mapping(target = "absenceTypeName", source = "absenceType.name")
    @Mapping(target = "date", source = "absenceDate")
    @Mapping(target = "absenceTypeColor", ignore = true)
    @Mapping(target = "documentUrl", ignore = true)
    AbsenceDTO toDto(Absence absence);

    @Mapping(target = "learner", ignore = true)
    @Mapping(target = "classroom", ignore = true)
    @Mapping(target = "absenceType", ignore = true)
    @Mapping(target = "absenceDate", source = "date")
    @Mapping(target = "arrivalTime", ignore = true)
    @Mapping(target = "isLate", ignore = true)
    @Mapping(target = "lateMinutes", ignore = true)
    Absence toEntity(AbsenceDTO absenceDTO);
}
