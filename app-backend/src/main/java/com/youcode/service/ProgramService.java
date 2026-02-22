package com.youcode.service;

import com.youcode.dto.ProgramDTO;
import com.youcode.entity.Program;
import com.youcode.entity.Sprint;
import com.youcode.mapper.ProgramMapper;
import com.youcode.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramMapper programMapper;

    public ProgramDTO createProgram(ProgramDTO dto) {
        Program program = programMapper.toEntity(dto);
        program.setGroupId(java.util.UUID.randomUUID().toString());
        program.setVersion(1);
        program.setStatus("ACTIVE");

        if (program.getSprints() != null) {
            program.getSprints().forEach(sprint -> sprint.setProgram(program));
        }

        Program saved = programRepository.save(program);
        return convertToDTO(saved);
    }

    public List<ProgramDTO> getAllPrograms() {
        return programRepository.findAll().stream()
                .filter(p -> p.getStatus().equals("ACTIVE") && isLatestVersion(p))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private boolean isLatestVersion(Program p) {
        return programRepository.findAll().stream()
                .filter(other -> other.getGroupId().equals(p.getGroupId()))
                .allMatch(other -> other.getVersion() <= p.getVersion());
    }

    public ProgramDTO getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));

        ProgramDTO dto = convertToDTO(program);

        // Fetch history
        List<ProgramDTO> history = programRepository.findAll().stream()
                .filter(p -> p.getGroupId().equals(program.getGroupId()))
                .sorted((p1, p2) -> p2.getVersion().compareTo(p1.getVersion()))
                .map(p -> ProgramDTO.builder()
                        .id(p.getId())
                        .version(p.getVersion())
                        .status(p.getStatus())
                        .build())
                .collect(Collectors.toList());

        dto.setHistory(history);
        return dto;
    }

    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }

    public ProgramDTO updateProgram(Long id, ProgramDTO dto) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));

        program.setTitle(dto.getTitle());
        program.setDescription(dto.getDescription());
        program.setSpeciality(dto.getSpeciality());

        Program updated = programRepository.save(program);
        return convertToDTO(updated);
    }

    public ProgramDTO createNewVersion(Long programId) {
        Program existingProgram = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));

        Program newVersion = Program.builder()
                .title(existingProgram.getTitle())
                .description(existingProgram.getDescription())
                .speciality(existingProgram.getSpeciality())
                .groupId(existingProgram.getGroupId())
                .version(existingProgram.getVersion() + 1)
                .status("ACTIVE")
                .parentId(existingProgram.getId())
                .build();

        // Deep copy sprints
        if (existingProgram.getSprints() != null) {
            existingProgram.getSprints().forEach(sprint -> {
                Sprint newSprint = Sprint.builder()
                        .title(sprint.getTitle())
                        .objective(sprint.getObjective())
                        .description(sprint.getDescription())
                        .startDate(sprint.getStartDate())
                        .endDate(sprint.getEndDate())
                        .technologies(sprint.getTechnologies())
                        .program(newVersion)
                        .build();
                newVersion.getSprints().add(newSprint);
            });
        }

        Program saved = programRepository.save(newVersion);
        return convertToDTO(saved);
    }

    public void archiveProgram(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        program.setStatus("ARCHIVED");
        programRepository.save(program);
    }

    private ProgramDTO convertToDTO(Program program) {
        return programMapper.toDto(program);
    }
}
