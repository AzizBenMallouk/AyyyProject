package com.youcode.service;

import com.youcode.dto.ClassroomDTO;
import com.youcode.dto.EnrollDTO;
import com.youcode.dto.SprintDTO;
import com.youcode.entity.*;
import com.youcode.mapper.ClassroomMapper;
import com.youcode.mapper.EnrollMapper;
import com.youcode.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final EnrollRepository enrollRepository;
    private final UserRepository userRepository;
    private final GradeRepository gradeRepository;
    private final CampusRepository campusRepository;
    private final PromotionRepository promotionRepository;
    private final ProgramRepository programRepository;
    private final ClassroomMapper classroomMapper;
    private final EnrollMapper enrollMapper;

    /**
     * Get all classrooms
     */
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get classroom by ID
     */
    public Optional<ClassroomDTO> getClassroomById(Long id) {
        return classroomRepository.findById(id)
                .map(this::convertToDTO);
    }

    /**
     * Create new classroom
     */
    public ClassroomDTO createClassroom(ClassroomDTO classroomDTO) {
        Classroom classroom = new Classroom();
        updateClassroomFields(classroom, classroomDTO);

        // Default to active
        if (classroom.getActive() == null) {
            classroom.setActive(true);
        }

        Classroom saved = classroomRepository.save(classroom);
        log.info("Created classroom: {}", saved.getName());

        // Handle initial enrollments
        if (classroomDTO.getStudentIds() != null && !classroomDTO.getStudentIds().isEmpty()) {
            List<User> learners = userRepository.findAllById(classroomDTO.getStudentIds());
            List<Enroll> enrollments = learners.stream()
                    .map(learner -> {
                        learner.setCurrentClassroom(saved); // Update current classroom
                        userRepository.save(learner);

                        return Enroll.builder()
                                .classroom(saved)
                                .learner(learner)
                                .enrollDate(LocalDate.now())
                                .active(true)
                                .build();
                    })
                    .collect(Collectors.toList());
            enrollRepository.saveAll(enrollments);
            log.info("Enrolled {} learners in classroom {}", enrollments.size(), saved.getName());
        }

        return convertToDTO(saved);
    }

    /**
     * Get filtered classrooms
     */
    public Page<ClassroomDTO> getFilteredClassrooms(Long campusId, Long promotionId, Long gradeId, String speciality,
            Long trainerId, Boolean active, String search, org.springframework.data.domain.Pageable pageable) {
        Specification<Classroom> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), likePattern));
            }

            if (campusId != null) {
                predicates.add(cb.equal(root.get("campus").get("id"), campusId));
            }
            if (promotionId != null) {
                predicates.add(cb.equal(root.get("promotion").get("id"), promotionId));
            }
            if (gradeId != null) {
                predicates.add(cb.equal(root.get("grade").get("id"), gradeId));
            }
            // Filter by Program ID (passed as speciality param for now, reused)
            if (speciality != null && !speciality.isEmpty()) {
                try {
                    Long program = Long.parseLong(speciality);
                    predicates.add(cb.equal(root.get("program").get("id"), program));
                } catch (NumberFormatException e) {
                    // ignore if not a number
                }
            }
            if (trainerId != null) {
                predicates.add(cb.equal(root.get("trainer").get("id"), trainerId));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return classroomRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Update classroom
     */
    public ClassroomDTO updateClassroom(Long id, ClassroomDTO classroomDTO) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));

        updateClassroomFields(classroom, classroomDTO);

        Classroom saved = classroomRepository.save(classroom);
        log.info("Updated classroom: {}", saved.getName());

        return convertToDTO(saved);
    }

    private void updateClassroomFields(Classroom classroom, ClassroomDTO dto) {
        if (dto.getName() != null)
            classroom.setName(dto.getName());
        if (dto.getDescription() != null)
            classroom.setDescription(dto.getDescription());
        if (dto.getStartDate() != null)
            classroom.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            classroom.setEndDate(dto.getEndDate());
        if (dto.getProfileImage() != null)
            classroom.setProfileImage(dto.getProfileImage());
        if (dto.getBootcamp() != null)
            classroom.setBootcamp(dto.getBootcamp());

        if (dto.getProgramId() != null) {
            Program program = programRepository.findById(dto.getProgramId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
            classroom.setProgram(program);
        }

        if (dto.getGradeId() != null) {
            Grade grade = gradeRepository.findById(dto.getGradeId())
                    .orElseThrow(() -> new RuntimeException("Grade not found"));
            classroom.setGrade(grade);
        }

        if (dto.getCampusId() != null) {
            Campus campus = campusRepository.findById(dto.getCampusId())
                    .orElseThrow(() -> new RuntimeException("Campus not found"));
            classroom.setCampus(campus);
        }

        if (dto.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(dto.getPromotionId())
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));
            classroom.setPromotion(promotion);
        }

        if (dto.getTrainerId() != null) {
            User trainer = userRepository.findById(dto.getTrainerId())
                    .orElseThrow(() -> new RuntimeException("Trainer not found"));
            classroom.setTrainer(trainer);
        }

        if (dto.getCmeId() != null) {
            User cme = userRepository.findById(dto.getCmeId())
                    .orElseThrow(() -> new RuntimeException("CME not found"));
            classroom.setCme(cme);
        }

        if (dto.getDelegateId() != null) {
            User delegate = userRepository.findById(dto.getDelegateId())
                    .orElseThrow(() -> new RuntimeException("Delegate not found"));
            classroom.setDelegate(delegate);
        }
    }

    /**
     * Get classrooms by trainer (staff member)
     */
    public List<ClassroomDTO> getClassroomsByTrainer(Long trainerId) {
        return classroomRepository.findByTrainerId(trainerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete classroom
     */
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + id));

        classroomRepository.delete(classroom);
        log.info("Deleted classroom: {}", classroom.getName());
    }

    /**
     * Enroll learner in classroom
     */
    public EnrollDTO enrollLearner(Long classroomId, Long learnerId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with id: " + classroomId));

        User learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new RuntimeException("Learner not found with id: " + learnerId));

        // Check if already enrolled
        Optional<Enroll> existing = enrollRepository.findByClassroomIdAndLearnerId(classroomId, learnerId);
        if (existing.isPresent()) {
            throw new RuntimeException("Learner already enrolled in this classroom");
        }

        Enroll enroll = new Enroll();
        enroll.setClassroom(classroom);
        enroll.setLearner(learner);
        enroll.setEnrollDate(LocalDate.now());
        enroll.setActive(true);

        Enroll saved = enrollRepository.save(enroll);
        log.info("Enrolled learner {} in classroom {}", learner.getUsername(), classroom.getName());

        return convertEnrollToDTO(saved);
    }

    /**
     * Remove learner from classroom
     */
    public void removeLearner(Long classroomId, Long learnerId) {
        Enroll enroll = enrollRepository.findByClassroomIdAndLearnerId(classroomId, learnerId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollRepository.delete(enroll);
        log.info("Removed learner {} from classroom {}", learnerId, classroomId);
    }

    /**
     * Get enrolled learners for a classroom
     */
    public List<EnrollDTO> getEnrolledLearners(Long classroomId) {
        return enrollRepository.findByClassroomId(classroomId)
                .stream()
                .map(this::convertEnrollToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Classroom entity to DTO
     */
    private ClassroomDTO convertToDTO(Classroom classroom) {
        ClassroomDTO dto = classroomMapper.toDto(classroom);

        int enrolledCount = enrollRepository.countByClassroomId(classroom.getId());
        dto.setEnrolledCount(enrolledCount);

        // Populate currentSprint
        if (classroom.getProgram() != null && classroom.getProgram().getSprints() != null) {
            LocalDate today = LocalDate.now();
            Sprint currentSprint = classroom.getProgram().getSprints().stream()
                    .filter(s -> !today.isBefore(s.getStartDate()) && !today.isAfter(s.getEndDate()))
                    .findFirst()
                    .orElse(null);

            if (currentSprint != null) {
                SprintDTO sprintDTO = SprintDTO.builder()
                        .id(currentSprint.getId())
                        .title(currentSprint.getTitle())
                        .description(currentSprint.getDescription())
                        .objective(currentSprint.getObjective())
                        .startDate(currentSprint.getStartDate())
                        .endDate(currentSprint.getEndDate())
                        .technologies(currentSprint.getTechnologies())
                        .programId(classroom.getProgram().getId())
                        .build();
                dto.setCurrentSprint(sprintDTO);
            }
        }

        return dto;
    }

    /**
     * Convert Enroll entity to DTO
     */
    private EnrollDTO convertEnrollToDTO(Enroll enroll) {
        return enrollMapper.toDto(enroll);
    }
}
