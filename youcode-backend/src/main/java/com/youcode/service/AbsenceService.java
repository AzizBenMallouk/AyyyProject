package com.youcode.service;

import com.youcode.dto.AbsenceDTO;
import com.youcode.entity.Absence;
import com.youcode.entity.AbsenceType;
import com.youcode.entity.Classroom;
import com.youcode.entity.User;
import com.youcode.repository.AbsenceRepository;
import com.youcode.repository.AbsenceTypeRepository;
import com.youcode.repository.ClassroomRepository;
import com.youcode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final AbsenceTypeRepository absenceTypeRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    /**
     * Get all absence types
     */
    public List<AbsenceType> getAllAbsenceTypes() {
        return absenceTypeRepository.findAll();
    }

    /**
     * Create absence
     */
    public AbsenceDTO createAbsence(AbsenceDTO dto) {
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        User learner = userRepository.findById(dto.getLearnerId())
                .orElseThrow(() -> new RuntimeException("Learner not found"));

        AbsenceType type = absenceTypeRepository.findById(dto.getAbsenceTypeId())
                .orElseThrow(() -> new RuntimeException("Absence Type not found"));

        Absence absence = new Absence();
        absence.setClassroom(classroom);
        absence.setLearner(learner);
        absence.setAbsenceType(type);
        absence.setAbsenceDate(dto.getDate());
        absence.setReason(dto.getReason());
        absence.setJustified(dto.getJustified() != null ? dto.getJustified() : false);

        // Handle "LATE" specific logic if needed (e.g., arrival time) - simpler for now

        Absence saved = absenceRepository.save(absence);
        log.info("Created absence for learner {} in classroom {}", learner.getUsername(), classroom.getName());

        return convertToDTO(saved);
    }

    /**
     * Get absences by classroom
     */
    public List<AbsenceDTO> getAbsencesByClassroom(Long classroomId) {
        return absenceRepository.findByClassroomId(classroomId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AbsenceDTO convertToDTO(Absence absence) {
        return AbsenceDTO.builder()
                .id(absence.getId())
                .learnerId(absence.getLearner().getId())
                .learnerName(absence.getLearner().getName())
                .classroomId(absence.getClassroom().getId())
                .absenceTypeId(absence.getAbsenceType().getId())
                .absenceTypeName(absence.getAbsenceType().getName())
                // .absenceTypeColor() // Could add color to entity or infer here
                .date(absence.getAbsenceDate())
                .reason(absence.getReason())
                .justified(absence.getJustified())
                .createdAt(absence.getCreatedAt())
                .build();
    }
}
