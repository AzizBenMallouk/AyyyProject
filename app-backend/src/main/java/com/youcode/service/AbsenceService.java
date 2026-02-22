package com.youcode.service;

import com.youcode.dto.AbsenceDTO;
import com.youcode.entity.Absence;
import com.youcode.entity.AbsenceType;
import com.youcode.entity.Classroom;
import com.youcode.entity.User;
import com.youcode.mapper.AbsenceMapper;
import com.youcode.repository.AbsenceRepository;
import com.youcode.repository.AbsenceTypeRepository;
import com.youcode.repository.ClassroomRepository;
import com.youcode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final AbsenceTypeRepository absenceTypeRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final AbsenceMapper absenceMapper;

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

        Absence absence = absenceMapper.toEntity(dto);
        absence.setClassroom(classroom);
        absence.setLearner(learner);
        absence.setAbsenceType(type);

        if (absence.getJustified() == null) {
            absence.setJustified(false);
        }

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
                .toList();
    }

    private AbsenceDTO convertToDTO(Absence absence) {
        return absenceMapper.toDto(absence);
    }
}
