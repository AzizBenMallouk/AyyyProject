package com.youcode.mapper;

import com.youcode.dto.CampusDTO;
import com.youcode.entity.Campus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CampusMapper {
    @Mapping(target = "cityId", ignore = true)
    @Mapping(target = "cityName", ignore = true)
    CampusDTO toDto(Campus campus);

    @Mapping(target = "city", ignore = true)
    Campus toEntity(CampusDTO campusDTO);
}
