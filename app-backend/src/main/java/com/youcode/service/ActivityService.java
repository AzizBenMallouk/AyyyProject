package com.youcode.service;

import com.youcode.dto.ActivityDTO;
import com.youcode.entity.Activity;
import com.youcode.entity.ClassroomActivityType;
import com.youcode.mapper.ActivityMapper;
import com.youcode.repository.ActivityRepository;
import com.youcode.repository.ClassroomActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ClassroomActivityTypeRepository activityTypeRepository;
    private final ActivityMapper activityMapper;

    public List<ActivityDTO> getAllActivities() {
        return activityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ActivityDTO> getActivityById(Long id) {
        return activityRepository.findById(id).map(this::convertToDTO);
    }

    public ActivityDTO createActivity(ActivityDTO dto) {
        Activity activity = activityMapper.toEntity(dto);
        updateType(activity, dto);
        activity = activityRepository.save(activity);
        return convertToDTO(activity);
    }

    public ActivityDTO updateActivity(Long id, ActivityDTO dto) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        activity.setTitle(dto.getTitle());
        activity.setDescription(dto.getDescription());
        activity.setDurationMinutes(dto.getDurationMinutes());
        activity.setDifficultyLevel(dto.getDifficultyLevel());
        activity.setAssignmentType(dto.getAssignmentType());
        activity.setResources(dto.getResources());

        updateType(activity, dto);
        activity = activityRepository.save(activity);
        return convertToDTO(activity);
    }

    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

    private void updateType(Activity activity, ActivityDTO dto) {
        if (dto.getTypeId() != null) {
            ClassroomActivityType type = activityTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new RuntimeException("Activity Type not found"));
            activity.setActivityType(type);
        } else if (dto.getType() != null) {
            ClassroomActivityType type = activityTypeRepository.findByName(dto.getType())
                    .orElse(null);
            activity.setActivityType(type);
        }
    }

    private ActivityDTO convertToDTO(Activity activity) {
        return activityMapper.toDto(activity);
    }
}
