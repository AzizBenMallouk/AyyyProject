package com.youcode.service;

import com.youcode.dto.SquadDTO;
import com.youcode.entity.Classroom;
import com.youcode.entity.Enroll;
import com.youcode.entity.Squad;
import com.youcode.mapper.SquadMapper;
import com.youcode.repository.ClassroomRepository;
import com.youcode.repository.EnrollRepository;
import com.youcode.repository.SquadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SquadService {

        private final SquadRepository squadRepository;
        private final ClassroomRepository classroomRepository;
        private final EnrollRepository enrollRepository;
        private final com.youcode.repository.SprintRepository sprintRepository;
        private final com.youcode.repository.UserRepository userRepository;
        private final SquadMapper squadMapper;

        public SquadDTO createSquad(SquadDTO squadDTO) {
                Classroom classroom = classroomRepository.findById(squadDTO.getClassroomId())
                                .orElseThrow(() -> new RuntimeException("Classroom not found"));

                com.youcode.entity.Sprint sprint = null;
                if (squadDTO.getSprintId() != null) {
                        sprint = sprintRepository.findById(squadDTO.getSprintId()).orElse(null);
                }

                com.youcode.entity.User scrumMaster = null;
                if (squadDTO.getScrumMasterId() != null) {
                        scrumMaster = userRepository.findById(squadDTO.getScrumMasterId()).orElse(null);
                }

                Squad squad = squadMapper.toEntity(squadDTO);
                squad.setClassroom(classroom);
                squad.setSprint(sprint);
                squad.setScrumMaster(scrumMaster);

                Squad saved = squadRepository.save(squad);
                return convertToDTO(saved);
        }

        public List<SquadDTO> getSquadsByClassroom(Long classroomId, Long sprintId) {
                List<Squad> squads;
                if (sprintId != null) {
                        squads = squadRepository.findByClassroomIdAndSprintId(classroomId, sprintId);
                } else {
                        squads = squadRepository.findByClassroomId(classroomId);
                }
                return squads.stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public void assignLearnerToSquad(Long squadId, Long learnerId) {
                Squad squad = squadRepository.findById(squadId)
                                .orElseThrow(() -> new RuntimeException("Squad not found"));

                com.youcode.entity.User learner = userRepository.findById(learnerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (squad.getSprint() != null) {
                        List<Squad> sprintSquads = squadRepository.findByClassroomIdAndSprintId(
                                        squad.getClassroom().getId(), squad.getSprint().getId());
                        for (Squad s : sprintSquads) {
                                if (s.getMembers().contains(learner)) {
                                        s.getMembers().remove(learner);
                                        squadRepository.save(s);
                                }
                        }
                }

                squad.getMembers().add(learner);
                squadRepository.save(squad);
        }

        public void removeLearnerFromSquad(Long learnerId, Long squadId) {
                Squad squad = squadRepository.findById(squadId)
                                .orElseThrow(() -> new RuntimeException("Squad not found"));

                com.youcode.entity.User learner = userRepository.findById(learnerId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                squad.getMembers().remove(learner);
                squadRepository.save(squad);
        }

        public List<SquadDTO> generateSquads(Long classroomId, Long sprintId, int numberOfSquads,
                        boolean maximizeNewConnections, boolean distributeGender, boolean rotateScrumMaster) {
                Classroom classroom = classroomRepository.findById(classroomId)
                                .orElseThrow(() -> new RuntimeException("Classroom not found"));

                com.youcode.entity.Sprint sprint = sprintRepository.findById(sprintId)
                                .orElseThrow(() -> new RuntimeException("Sprint not found"));

                List<com.youcode.entity.User> learners = enrollRepository.findByClassroomId(classroomId).stream()
                                .filter(e -> e.getActive() == null || e.getActive())
                                .map(Enroll::getLearner)
                                .collect(Collectors.toList());

                if (learners.isEmpty())
                        return List.of();

                List<Squad> existingSquads = squadRepository.findByClassroomIdAndSprintId(classroomId, sprintId);
                if (!existingSquads.isEmpty()) {
                        squadRepository.deleteAll(existingSquads);
                }

                List<Squad> allClassroomSquads = squadRepository.findByClassroomId(classroomId);

                java.util.Map<Long, java.util.Set<Long>> pastConnections = new java.util.HashMap<>();
                java.util.Map<Long, Integer> smCount = new java.util.HashMap<>();

                for (com.youcode.entity.User u : learners) {
                        pastConnections.put(u.getId(), new java.util.HashSet<>());
                        smCount.put(u.getId(), 0);
                }

                for (Squad s : allClassroomSquads) {
                        if (s.getScrumMaster() != null) {
                                smCount.merge(s.getScrumMaster().getId(), 1, Integer::sum);
                        }
                        List<Long> memberIds = s.getMembers().stream().map(com.youcode.entity.User::getId)
                                        .collect(Collectors.toList());
                        for (Long id1 : memberIds) {
                                for (Long id2 : memberIds) {
                                        if (!id1.equals(id2)) {
                                                if (pastConnections.containsKey(id1))
                                                        pastConnections.get(id1).add(id2);
                                        }
                                }
                        }
                }

                java.util.Collections.shuffle(learners);

                List<com.youcode.entity.User> males = new java.util.ArrayList<>();
                List<com.youcode.entity.User> females = new java.util.ArrayList<>();

                for (com.youcode.entity.User u : learners) {
                        if (u.getGender() != null && (u.getGender().toLowerCase().startsWith("f"))) {
                                females.add(u);
                        } else {
                                males.add(u);
                        }
                }

                List<List<com.youcode.entity.User>> squadBuckets = new java.util.ArrayList<>();
                for (int i = 0; i < numberOfSquads; i++) {
                        squadBuckets.add(new java.util.ArrayList<>());
                }

                int currentSquadIndex = 0;

                if (distributeGender) {
                        for (com.youcode.entity.User f : females) {
                                squadBuckets.get(currentSquadIndex).add(f);
                                currentSquadIndex = (currentSquadIndex + 1) % numberOfSquads;
                        }
                } else {
                        males.addAll(females);
                }

                for (com.youcode.entity.User m : males) {
                        if (maximizeNewConnections) {
                                int bestBucketIndex = -1;
                                int minConflicts = Integer.MAX_VALUE;

                                int minSize = Integer.MAX_VALUE;
                                for (List<com.youcode.entity.User> b : squadBuckets)
                                        minSize = Math.min(minSize, b.size());

                                List<Integer> candidateBuckets = new java.util.ArrayList<>();
                                for (int i = 0; i < numberOfSquads; i++) {
                                        if (squadBuckets.get(i).size() <= minSize + 1)
                                                candidateBuckets.add(i);
                                }

                                for (int i : candidateBuckets) {
                                        int conflicts = 0;
                                        for (com.youcode.entity.User member : squadBuckets.get(i)) {
                                                if (pastConnections.get(m.getId()).contains(member.getId())) {
                                                        conflicts++;
                                                }
                                        }

                                        if (conflicts < minConflicts) {
                                                minConflicts = conflicts;
                                                bestBucketIndex = i;
                                        }
                                }

                                if (bestBucketIndex != -1) {
                                        squadBuckets.get(bestBucketIndex).add(m);
                                } else {
                                        squadBuckets.get(currentSquadIndex).add(m);
                                        currentSquadIndex = (currentSquadIndex + 1) % numberOfSquads;
                                }

                        } else {
                                squadBuckets.get(currentSquadIndex).add(m);
                                currentSquadIndex = (currentSquadIndex + 1) % numberOfSquads;
                        }
                }

                List<SquadDTO> results = new java.util.ArrayList<>();
                int squadNum = 1;

                for (List<com.youcode.entity.User> members : squadBuckets) {
                        if (members.isEmpty())
                                continue;

                        Squad squad = new Squad();
                        squad.setName("Squad " + squadNum + " - " + sprint.getTitle());
                        squad.setClassroom(classroom);
                        squad.setSprint(sprint);
                        squad.setMembers(new java.util.HashSet<>(members));

                        if (rotateScrumMaster && !members.isEmpty()) {
                                com.youcode.entity.User bestSM = members.get(0);
                                int minSMCount = Integer.MAX_VALUE;

                                for (com.youcode.entity.User u : members) {
                                        int count = smCount.getOrDefault(u.getId(), 0);
                                        if (count < minSMCount) {
                                                minSMCount = count;
                                                bestSM = u;
                                        }
                                }
                                squad.setScrumMaster(bestSM);
                        } else if (!members.isEmpty()) {
                                squad.setScrumMaster(members.get(0));
                        }

                        Squad saved = squadRepository.save(squad);
                        results.add(convertToDTO(saved));
                        squadNum++;
                }

                return results;
        }

        private SquadDTO convertToDTO(Squad squad) {
                return squadMapper.toDto(squad);
        }
}
