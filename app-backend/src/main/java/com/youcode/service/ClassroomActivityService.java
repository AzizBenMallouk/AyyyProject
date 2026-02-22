package com.youcode.service;

import com.youcode.dto.ClassroomActivityDTO;
import com.youcode.entity.Classroom;
import com.youcode.entity.ClassroomActivity;
import com.youcode.mapper.ClassroomActivityMapper;
import com.youcode.repository.ClassroomActivityRepository;
import com.youcode.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClassroomActivityService {

    private final ClassroomActivityRepository activityRepository;
    private final ClassroomRepository classroomRepository;
    private final com.youcode.repository.ClassroomActivityTypeRepository classroomActivityTypeRepository;
    private final ClassroomActivityMapper classroomActivityMapper;

    /**
     * Get all activities
     */
    public List<ClassroomActivityDTO> getAllActivities() {
        return activityRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all activity types
     */
    public List<com.youcode.entity.ClassroomActivityType> getAllActivityTypes() {
        return classroomActivityTypeRepository.findAll();
    }

    /**
     * Get activity by ID
     */
    public Optional<ClassroomActivityDTO> getActivityById(Long id) {
        return activityRepository.findById(id)
                .map(this::convertToDTO);
    }

    /**
     * Get activities by classroom
     */
    public List<ClassroomActivityDTO> getActivitiesByClassroom(Long classroomId) {
        return activityRepository.findByClassroomIdOrderByDeadlineAsc(classroomId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new activity
     */
    public ClassroomActivityDTO createActivity(ClassroomActivityDTO activityDTO) {
        Classroom classroom = classroomRepository.findById(activityDTO.getClassroomId())
                .orElseThrow(
                        () -> new RuntimeException("Classroom not found with id: " + activityDTO.getClassroomId()));

        ClassroomActivity activity = classroomActivityMapper.toEntity(activityDTO);
        activity.setClassroom(classroom);

        // Handle Activity Type
        if (activityDTO.getTypeId() != null) {
            com.youcode.entity.ClassroomActivityType type = classroomActivityTypeRepository
                    .findById(activityDTO.getTypeId())
                    .orElseThrow(
                            () -> new RuntimeException("Activity Type not found with id: " + activityDTO.getTypeId()));
            activity.setActivityType(type);
        } else if (activityDTO.getType() != null) {
            com.youcode.entity.ClassroomActivityType type = classroomActivityTypeRepository
                    .findByName(activityDTO.getType())
                    .orElse(null);
            activity.setActivityType(type);
        }

        // Convert LocalDate to LocalDateTime for deadline
        if (activityDTO.getDueDate() != null) {
            activity.setDeadline(LocalDateTime.of(activityDTO.getDueDate(), LocalTime.of(23, 59)));
        }

        // Handle Sprint
        if (activityDTO.getSprintId() != null) {
            com.youcode.entity.Sprint sprint = new com.youcode.entity.Sprint();
            sprint.setId(activityDTO.getSprintId());
            activity.setSprint(sprint);
        }

        // Handle Parent Activity (for Debriefing)
        if (activityDTO.getParentActivityId() != null) {
            ClassroomActivity parent = activityRepository.findById(activityDTO.getParentActivityId())
                    .orElse(null);
            activity.setParentActivity(parent);
        }

        activity.setActive(true);

        // Multi-classroom distribution logic
        if ("MANY_CLASSROOMS".equals(activityDTO.getAssignmentType()) && activityDTO.getTargetIds() != null) {
            List<Long> targetIds = activityDTO.getTargetIds();
            for (Long targetId : targetIds) {
                if (!targetId.equals(classroom.getId())) {
                    try {
                        Classroom targetClassroom = classroomRepository.findById(targetId).orElse(null);
                        if (targetClassroom != null) {
                            ClassroomActivity clone = new ClassroomActivity();
                            clone.setTitle(activity.getTitle());
                            clone.setDescription(activity.getDescription());
                            clone.setActivityType(activity.getActivityType());
                            clone.setDeadline(activity.getDeadline());
                            clone.setStartDate(activity.getStartDate());
                            clone.setMaxPoints(activity.getMaxPoints());
                            clone.setAssignmentType(activity.getAssignmentType());
                            clone.setDuration(activity.getDuration());
                            clone.setIsRecurring(activity.getIsRecurring());
                            clone.setRecurrencePattern(activity.getRecurrencePattern());
                            clone.setResources(activity.getResources());
                            clone.setSprint(activity.getSprint());
                            clone.setParentActivity(activity.getParentActivity());
                            clone.setActive(true);
                            clone.setClassroom(targetClassroom);
                            activityRepository.save(clone);
                        }
                    } catch (Exception e) {
                        log.error("Failed to distribute activity to classroom " + targetId, e);
                    }
                }
            }
        }

        ClassroomActivity saved = activityRepository.save(activity);
        log.info("Created activity: {} for classroom: {}", saved.getTitle(), classroom.getName());

        return convertToDTO(saved);
    }

    /**
     * Update activity
     */
    public ClassroomActivityDTO updateActivity(Long id, ClassroomActivityDTO activityDTO) {
        ClassroomActivity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        if (activityDTO.getTitle() != null)
            activity.setTitle(activityDTO.getTitle());
        if (activityDTO.getDescription() != null)
            activity.setDescription(activityDTO.getDescription());
        if (activityDTO.getDueDate() != null) {
            activity.setDeadline(LocalDateTime.of(activityDTO.getDueDate(), LocalTime.of(23, 59)));
        }
        if (activityDTO.getMaxPoints() != null)
            activity.setMaxPoints(activityDTO.getMaxPoints());
        if (activityDTO.getAssignmentType() != null)
            activity.setAssignmentType(activityDTO.getAssignmentType());
        if (activityDTO.getDuration() != null)
            activity.setDuration(activityDTO.getDuration());
        if (activityDTO.getIsRecurring() != null)
            activity.setIsRecurring(activityDTO.getIsRecurring());
        if (activityDTO.getRecurrencePattern() != null)
            activity.setRecurrencePattern(activityDTO.getRecurrencePattern());
        if (activityDTO.getStartDate() != null) {
            activity.setStartDate(activityDTO.getStartDate());
        }
        if (activityDTO.getResources() != null)
            activity.setResources(activityDTO.getResources());

        // Handle Activity Type Update
        if (activityDTO.getTypeId() != null) {
            com.youcode.entity.ClassroomActivityType type = classroomActivityTypeRepository
                    .findById(activityDTO.getTypeId())
                    .orElseThrow(
                            () -> new RuntimeException("Activity Type not found with id: " + activityDTO.getTypeId()));
            activity.setActivityType(type);
        }

        ClassroomActivity saved = activityRepository.save(activity);
        log.info("Updated activity: {}", saved.getTitle());

        return convertToDTO(saved);
    }

    /**
     * Delete activity
     */
    public void deleteActivity(Long id) {
        if (!activityRepository.existsById(id)) {
            throw new RuntimeException("Activity not found with id: " + id);
        }
        activityRepository.deleteById(id);
    }

    /**
     * Get activities by program with pagination
     */
    public org.springframework.data.domain.Page<ClassroomActivityDTO> getActivitiesByProgram(Long programId,
            org.springframework.data.domain.Pageable pageable) {
        return activityRepository.findByClassroomProgramId(programId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Convert ClassroomActivity entity to DTO
     */
    private ClassroomActivityDTO convertToDTO(ClassroomActivity activity) {
        return classroomActivityMapper.toDto(activity);
    }

    /**
     * Get action plans with filters
     */
    public org.springframework.data.domain.Page<ClassroomActivityDTO> getActionPlans(
            org.springframework.data.domain.Pageable pageable,
            com.youcode.dto.ActivityFilterDTO filters) {

        org.springframework.data.jpa.domain.Specification<ClassroomActivity> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            if (filters.getType() != null && !filters.getType().isEmpty()) {
                predicates.add(cb.equal(root.get("activityType").get("name"), filters.getType()));
            } else {
                predicates.add(cb.equal(root.get("activityType").get("name"), "ACTION_PLAN"));
            }

            if (filters.getClassroomId() != null) {
                predicates.add(cb.equal(root.get("classroom").get("id"), filters.getClassroomId()));
            }

            if (filters.getSprintId() != null) {
                predicates.add(cb.equal(root.get("sprint").get("id"), filters.getSprintId()));
            }

            if (filters.getCampusId() != null) {
                predicates.add(cb.equal(root.get("classroom").get("campus").get("id"), filters.getCampusId()));
            }

            if (filters.getPromotionId() != null) {
                predicates.add(cb.equal(root.get("classroom").get("promotion").get("id"), filters.getPromotionId()));
            }

            if (filters.getGradeId() != null) {
                predicates.add(cb.equal(root.get("classroom").get("grade").get("id"), filters.getGradeId()));
            }

            if (filters.getProgramId() != null) {
                predicates.add(cb.equal(root.get("classroom").get("program").get("id"), filters.getProgramId()));
            }

            if (filters.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), filters.getDateFrom().atStartOfDay()));
            }

            if (filters.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("deadline"), filters.getDateTo().atTime(23, 59)));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return activityRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }
}
