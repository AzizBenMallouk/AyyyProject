package com.youcode.service;

import com.youcode.dto.InterviewPositionDTO;
import com.youcode.dto.SoftSkillEvaluationDTO;
import com.youcode.dto.StudentInterviewDTO;
import com.youcode.entity.*;
import com.youcode.mapper.InterviewPositionMapper;
import com.youcode.mapper.SoftSkillEvaluationMapper;
import com.youcode.mapper.StudentInterviewMapper;
import com.youcode.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InterviewService {

        private final InterviewPositionRepository positionRepository;
        private final StudentInterviewRepository interviewRepository;
        private final SoftSkillEvaluationRepository evaluationRepository;
        private final UserRepository userRepository;
        private final SoftSkillRepository softSkillRepository;
        private final StudentInterviewMapper studentInterviewMapper;
        private final InterviewPositionMapper interviewPositionMapper;
        private final SoftSkillEvaluationMapper softSkillEvaluationMapper;

        // --- Interview Position Management ---

        public List<InterviewPositionDTO> getAllPositions() {
                return positionRepository.findAll().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public InterviewPositionDTO createPosition(InterviewPositionDTO dto) {
                InterviewPosition position = interviewPositionMapper.toEntity(dto);
                return convertToDTO(positionRepository.save(position));
        }

        public void deletePosition(Long id) {
                positionRepository.deleteById(id);
        }

        // --- Student Interview Management ---

        public StudentInterviewDTO createInterview(Long studentId, Long positionId, java.time.LocalDateTime date) {
                User student = userRepository.findById(studentId)
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                InterviewPosition position = positionRepository.findById(positionId)
                                .orElseThrow(() -> new RuntimeException("Position not found"));

                StudentInterview interview = StudentInterview.builder()
                                .student(student)
                                .position(position)
                                .interviewDate(date)
                                .status(StudentInterview.InterviewStatus.SCHEDULED)
                                .build();

                return convertToDTO(interviewRepository.save(interview));
        }

        public List<StudentInterviewDTO> getInterviewsByStudent(Long studentId) {
                return interviewRepository.findByStudentId(studentId).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<StudentInterviewDTO> getAllInterviews() {
                return interviewRepository.findAll().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public StudentInterviewDTO updateInterviewStatus(Long interviewId, String status) {
                StudentInterview interview = interviewRepository.findById(interviewId)
                                .orElseThrow(() -> new RuntimeException("Interview not found"));
                interview.setStatus(StudentInterview.InterviewStatus.valueOf(status));
                return convertToDTO(interviewRepository.save(interview));
        }

        public StudentInterviewDTO updateGlobalComment(Long interviewId, String comment) {
                StudentInterview interview = interviewRepository.findById(interviewId)
                                .orElseThrow(() -> new RuntimeException("Interview not found"));
                interview.setGlobalComment(comment);
                return convertToDTO(interviewRepository.save(interview));
        }

        // --- Evaluations ---

        public void addEvaluation(Long interviewId, SoftSkillEvaluationDTO dto) {
                StudentInterview interview = interviewRepository.findById(interviewId)
                                .orElseThrow(() -> new RuntimeException("Interview not found"));

                SoftSkill softSkill = softSkillRepository.findById(dto.getSoftSkillId())
                                .orElseThrow(() -> new RuntimeException("Soft skill not found"));

                SoftSkillEvaluation evaluation = interview.getEvaluations().stream()
                                .filter(e -> e.getSoftSkill().getId().equals(softSkill.getId()))
                                .findFirst()
                                .orElse(SoftSkillEvaluation.builder()
                                                .interview(interview)
                                                .softSkill(softSkill)
                                                .build());

                evaluation.setScore(dto.getScore());
                evaluation.setComment(dto.getComment());

                evaluationRepository.save(evaluation);
        }

        // --- Converters ---

        private InterviewPositionDTO convertToDTO(InterviewPosition position) {
                return interviewPositionMapper.toDto(position);
        }

        private StudentInterviewDTO convertToDTO(StudentInterview interview) {
                return studentInterviewMapper.toDto(interview);
        }

        private SoftSkillEvaluationDTO convertToDTO(SoftSkillEvaluation evaluation) {
                return softSkillEvaluationMapper.toDto(evaluation);
        }
}
