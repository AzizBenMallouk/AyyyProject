package com.youcode.service;

import com.youcode.dto.ActivityDTO;
import com.youcode.entity.Classroom;
import com.youcode.entity.ClassroomActivity;
import com.youcode.repository.ActivityRepository;
import com.youcode.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ClassroomRepository classroomRepository;
    private final com.youcode.repository.ClassroomActivityTypeRepository classroomActivityTypeRepository;

    /**
     * Get all activities
     */
    public List<ActivityDTO> getAllActivities() {
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
    public Optional<ActivityDTO> getActivityById(Long id) {
        return activityRepository.findById(id)
                .map(this::convertToDTO);
    }

    /**
     * Get activities by classroom
     */
    public List<ActivityDTO> getActivitiesByClassroom(Long classroomId) {
        return activityRepository.findByClassroomIdOrderByDeadlineAsc(classroomId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new activity
     */
    public ActivityDTO createActivity(ActivityDTO activityDTO) {
        Classroom classroom = classroomRepository.findById(activityDTO.getClassroomId())
                .orElseThrow(
                        () -> new RuntimeException("Classroom not found with id: " + activityDTO.getClassroomId()));

        ClassroomActivity activity = new ClassroomActivity();
        activity.setTitle(activityDTO.getTitle());
        activity.setDescription(activityDTO.getDescription());

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

        activity.setMaxPoints(activityDTO.getMaxPoints());
        activity.setClassroom(classroom);
        activity.setActive(true);

        ClassroomActivity saved = activityRepository.save(activity);
        log.info("Created activity: {} for classroom: {}", saved.getTitle(), classroom.getName());

        return convertToDTO(saved);
    }

    /**
     * Update activity
     */
    public ActivityDTO updateActivity(Long id, ActivityDTO activityDTO) {
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
        ClassroomActivity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + id));

        activityRepository.delete(activity);
        log.info("Deleted activity: {}", activity.getTitle());
    }

    /**
     * Convert ClassroomActivity entity to DTO
     */
    private ActivityDTO convertToDTO(ClassroomActivity activity) {
        LocalDate dueDate = activity.getDeadline() != null ? activity.getDeadline().toLocalDate() : null;

        return ActivityDTO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .description(activity.getDescription())
                .type(activity.getActivityType() != null ? activity.getActivityType().getName() : null)
                .typeId(activity.getActivityType() != null ? activity.getActivityType().getId() : null)
                .dueDate(dueDate)
                .maxPoints(activity.getMaxPoints())
                .classroomId(activity.getClassroom().getId())
                .classroomName(activity.getClassroom().getName())
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }
}
