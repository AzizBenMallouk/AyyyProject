package com.youcode.service;

import com.youcode.dto.PointDTO;
import com.youcode.entity.Point;
import com.youcode.repository.PointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PointService {

    private final PointRepository pointRepository;

    /**
     * Get all points
     */
    public List<PointDTO> getAllPoints() {
        return pointRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get points by learner
     */
    public List<PointDTO> getPointsByLearner(Long learnerId) {
        return pointRepository.findByLearnerId(learnerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get total points for a learner
     */
    public Integer getTotalPoints(Long learnerId) {
        Integer total = pointRepository.getTotalPointsByLearnerId(learnerId);
        return total != null ? total : 0;
    }

    /**
     * Get leaderboard (top scorers)
     */
    public List<PointDTO> getLeaderboard() {
        List<Object[]> results = pointRepository.findTopScorers();
        List<PointDTO> leaderboard = new ArrayList<>();

        for (Object[] result : results) {
            PointDTO dto = PointDTO.builder()
                    .learnerId(((Number) result[0]).longValue())
                    .learnerName((String) result[1])
                    .points(((Number) result[2]).intValue())
                    .build();
            leaderboard.add(dto);

            if (leaderboard.size() >= 10)
                break;
        }

        return leaderboard;
    }

    /**
     * Convert Point entity to DTO
     */
    private PointDTO convertToDTO(Point point) {
        String activityTitle = null;
        Long activityId = null;

        if (point.getClassroomActivityAssignment() != null &&
                point.getClassroomActivityAssignment().getClassroomActivity() != null) {
            activityTitle = point.getClassroomActivityAssignment().getClassroomActivity().getTitle();
            activityId = point.getClassroomActivityAssignment().getClassroomActivity().getId();
        }

        return PointDTO.builder()
                .id(point.getId())
                .learnerId(point.getLearner().getId())
                .learnerName(point.getLearner().getName())
                .activityId(activityId)
                .activityTitle(activityTitle)
                .points(point.getValue())
                .feedback(point.getComment())
                .createdAt(point.getCreatedAt())
                .build();
    }
}
