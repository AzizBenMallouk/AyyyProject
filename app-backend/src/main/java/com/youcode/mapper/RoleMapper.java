package com.youcode.mapper;

import com.youcode.dto.RoleDTO;
import com.youcode.entity.Role;
import com.youcode.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", source = "permissions", qualifiedByName = "mapPermissionsToNames")
    RoleDTO toDto(Role role);

    @Mapping(target = "permissions", ignore = true)
    @Mapping(target = "users", ignore = true)
    Role toEntity(RoleDTO roleDTO);

    @Named("mapPermissionsToNames")
    default List<String> mapPermissionsToNames(Set<Permission> permissions) {
        if (permissions == null)
            return null;
        return permissions.stream()
                .map(Permission::getName)
                .collect(Collectors.toList());
    }
}
