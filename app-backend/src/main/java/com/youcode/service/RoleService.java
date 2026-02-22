package com.youcode.service;

import com.youcode.dto.RoleDTO;
import com.youcode.entity.Role;
import com.youcode.mapper.RoleMapper;
import com.youcode.repository.PermissionRepository;
import com.youcode.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO createRole(RoleDTO roleDTO) {
        Role role = roleMapper.toEntity(roleDTO);

        if (roleDTO.getPermissions() != null) {
            role.setPermissions(roleDTO.getPermissions().stream()
                    .map(name -> permissionRepository.findByName(name).orElse(null))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet()));
        }

        return convertToDTO(roleRepository.save(role));
    }

    public RoleDTO updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));

        if (roleDTO.getName() != null)
            role.setName(roleDTO.getName());
        if (roleDTO.getDescription() != null)
            role.setDescription(roleDTO.getDescription());
        if (roleDTO.getRoleType() != null)
            role.setRoleType(roleDTO.getRoleType());

        if (roleDTO.getPermissions() != null) {
            java.util.Set<com.youcode.entity.Permission> newPermissions = roleDTO.getPermissions().stream()
                    .map(name -> permissionRepository.findByName(name).orElse(null))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
            role.setPermissions(newPermissions);
        }

        return convertToDTO(roleRepository.save(role));
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    public List<String> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(com.youcode.entity.Permission::getName)
                .collect(Collectors.toList());
    }

    private RoleDTO convertToDTO(Role role) {
        return roleMapper.toDto(role);
    }
}
