package com.youcode.mapper;

import com.youcode.dto.ActivityDTO;
import com.youcode.entity.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
    @Mapping(target = "type", source = "activityType.name")
    @Mapping(target = "typeId", source = "activityType.id")
    ActivityDTO toDto(Activity activity);

    @Mapping(target = "activityType", ignore = true)
    Activity toEntity(ActivityDTO activityDTO);
}
