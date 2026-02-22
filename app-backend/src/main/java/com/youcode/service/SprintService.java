package com.youcode.service;

import com.youcode.dto.SprintDTO;
import com.youcode.entity.Program;
import com.youcode.entity.Sprint;
import com.youcode.mapper.SprintMapper;
import com.youcode.repository.ProgramRepository;
import com.youcode.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProgramRepository programRepository;
    private final SprintMapper sprintMapper;

    public SprintDTO createSprint(SprintDTO dto) {
        Program program = programRepository.findById(dto.getProgramId())
                .orElseThrow(() -> new RuntimeException("Program not found"));

        Sprint sprint = sprintMapper.toEntity(dto);
        sprint.setProgram(program);

        Sprint saved = sprintRepository.save(sprint);
        return convertToDTO(saved);
    }

    public List<SprintDTO> getSprintsByProgram(Long programId) {
        return sprintRepository.findByProgramId(programId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteSprint(Long id) {
        sprintRepository.deleteById(id);
    }

    public SprintDTO updateSprint(Long id, SprintDTO dto) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        sprint.setTitle(dto.getTitle());
        sprint.setObjective(dto.getObjective());
        sprint.setDescription(dto.getDescription());
        sprint.setStartDate(dto.getStartDate());
        sprint.setEndDate(dto.getEndDate());
        if (dto.getTechnologies() != null) {
            sprint.setTechnologies(dto.getTechnologies());
        }

        Sprint updated = sprintRepository.save(sprint);
        return convertToDTO(updated);
    }

    private SprintDTO convertToDTO(Sprint sprint) {
        return sprintMapper.toDto(sprint);
    }
}
