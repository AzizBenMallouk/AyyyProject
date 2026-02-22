package com.youcode.config;

import com.youcode.entity.Role;
import com.youcode.entity.Permission;
import com.youcode.entity.User;
import com.youcode.entity.Classroom;
import com.youcode.entity.Enroll;
import com.youcode.entity.Grade;
import com.youcode.entity.Promotion;
import com.youcode.entity.Campus;
import com.youcode.entity.City;
import com.youcode.entity.Region;
import com.youcode.entity.Status;
import com.youcode.entity.AbsenceType;
import com.youcode.entity.Absence;
import com.youcode.entity.ClassroomActivityType;
import com.youcode.entity.ClassroomActivity;
import com.youcode.entity.Program;
import com.youcode.entity.Sprint;
import com.youcode.entity.Squad;
import com.youcode.entity.SoftSkill;
import com.youcode.entity.StudentInterview;
import com.youcode.entity.InterviewPosition;
import com.youcode.entity.SoftSkillEvaluation;
import com.youcode.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enhanced Database seeder using Datafaker
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final GradeRepository gradeRepository;
    private final PromotionRepository promotionRepository;
    private final CampusRepository campusRepository;
    private final CityRepository cityRepository;
    private final RegionRepository regionRepository;
    private final ClassroomRepository classroomRepository;
    private final StatusRepository statusRepository;
    private final AbsenceTypeRepository absenceTypeRepository;
    private final AbsenceRepository absenceRepository;
    private final ClassroomActivityTypeRepository classroomActivityTypeRepository;
    private final ClassroomActivityRepository activityRepository;
    private final ProgramRepository programRepository;
    private final SprintRepository sprintRepository;
    private final SquadRepository squadRepository;
    private final EnrollRepository enrollRepository;
    private final ClassroomActivityAssignmentRepository classroomActivityAssignmentRepository;
    private final ActivityCommentRepository activityCommentRepository;
    private final SoftSkillRepository softSkillRepository;
    private final InterviewPositionRepository interviewPositionRepository;
    private final StudentInterviewRepository studentInterviewRepository;
    private final SoftSkillEvaluationRepository softSkillEvaluationRepository;

    private final Faker faker = new Faker();

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            seed();
        };
    }

    @Transactional
    public void seed() {
        log.info("Starting database seeding with Datafaker...");

        // 1. Roles & Permissions (Core)
        seedPermissions();
        seedStatuses();
        seedRoles();

        // 2. Reference Data
        seedRegionsCitiesCampuses();
        seedGrades();
        seedPromotions();
        seedAbsenceTypes();
        seedActivityTypes();

        // 3. Programs & Sprints
        seedProgramsAndSprints();

        // 4. Users (Staff, Trainers, CMEs)
        seedStaffUsers();

        // 5. Classrooms & Assign Staff
        seedClassrooms();

        // 6. Learners & Enrollments (History + Current)
        seedLearnersAndEnrollments();

        // 7. Squads, Activities - Logic handled per classroom if active/past
        seedClassroomContent();

        // 8. Action Plans & Comments
        seedActionPlans();

        // 9. Soft Skills
        seedSoftSkills();

        // 10. Interviews & Evaluations
        seedInterviews();

        log.info("Database seeding completed successfully.");
    }

    private void seedActionPlans() {
        log.info("Seeding Action Plans...");
        List<Classroom> classrooms = classroomRepository.findAll();
        ClassroomActivityType actionPlanType = classroomActivityTypeRepository.findByName("ACTION_PLAN")
                .orElseGet(() -> {
                    ClassroomActivityType t = new ClassroomActivityType();
                    t.setName("ACTION_PLAN");
                    t.setColor("#FF5733");
                    return classroomActivityTypeRepository.save(t);
                });

        for (Classroom cls : classrooms) {
            // Create 3-5 Action Plans per classroom
            int planCount = faker.number().numberBetween(3, 6);
            List<Enroll> learners = enrollRepository.findByClassroomIdAndActiveTrue(cls.getId());

            if (learners.isEmpty())
                continue;

            for (int i = 0; i < planCount; i++) {
                ClassroomActivity plan = new ClassroomActivity();
                plan.setTitle("Action Plan: " + faker.job().keySkills());
                plan.setDescription(faker.lorem().paragraph(3));
                plan.setActivityType(actionPlanType);
                plan.setClassroom(cls);
                plan.setStartDate(LocalDate.now().minusDays(faker.number().numberBetween(1, 10)).atStartOfDay());
                plan.setDeadline(LocalDate.now().plusDays(faker.number().numberBetween(2, 20)).atStartOfDay());
                plan.setDuration(faker.number().numberBetween(30, 120)); // minutes
                plan.setMaxPoints(faker.number().numberBetween(10, 50));
                plan.setAssignmentType("INDIVIDUAL");

                plan = activityRepository.save(plan);

                // Assign to random 2-5 learners (or all if fewer)
                int assignCount = Math.min(learners.size(), faker.number().numberBetween(2, 6));
                List<Enroll> assignedLearners = new ArrayList<>(learners);
                java.util.Collections.shuffle(assignedLearners);

                for (int j = 0; j < assignCount; j++) {
                    User learner = assignedLearners.get(j).getLearner();
                    com.youcode.entity.ClassroomActivityAssignment assignment = new com.youcode.entity.ClassroomActivityAssignment();
                    assignment.setClassroomActivity(plan);
                    assignment.setLearner(learner);
                    assignment = classroomActivityAssignmentRepository.save(assignment);

                    // Add comments (Chat)
                    int commentCount = faker.number().numberBetween(1, 5);
                    for (int k = 0; k < commentCount; k++) {
                        com.youcode.entity.ActivityComment comment = new com.youcode.entity.ActivityComment();
                        comment.setAssignment(assignment);
                        // Randomly by learner or trainer
                        boolean isTrainer = faker.bool().bool();
                        comment.setUser(isTrainer ? cls.getTrainer() : learner);
                        comment.setContent(faker.lorem().sentence());
                        comment.setCreatedAt(
                                java.time.LocalDateTime.now().minusHours(faker.number().numberBetween(1, 100)));
                        activityCommentRepository.save(comment);
                    }
                }
            }
        }
    }

    private void seedPermissions() {
        List<String> permissionNames = List.of(
                "USER_READ", "USER_WRITE", "USER_DELETE",
                "ROLE_READ", "ROLE_WRITE", "ROLE_DELETE",
                "COURSE_READ", "COURSE_WRITE");

        permissionNames.forEach(name -> {
            if (permissionRepository.findByName(name).isEmpty()) {
                permissionRepository.save(Permission.builder().name(name).build());
            }
        });
    }

    private void seedStatuses() {
        List<String> statusNames = List.of("ACTIVE", "INACTIVE", "BANNED", "SUSPENDED", "GRADUATED", "INSERTED",
                "IN_STAGE");
        statusNames.forEach(name -> {
            if (statusRepository.findByName(name).isEmpty()) {
                statusRepository.save(Status.builder().name(name).description("User status " + name).build());
            }
        });
    }

    private void seedRoles() {
        createRoleIfNotFound("ADMIN", "Administrator", com.youcode.entity.enums.RoleType.ADMINISTRATIVE);
        createRoleIfNotFound("STAFF", "Staff", com.youcode.entity.enums.RoleType.STAFF);
        createRoleIfNotFound("TRAINER", "Trainer", com.youcode.entity.enums.RoleType.STAFF);
        createRoleIfNotFound("LEARNER", "Learner", com.youcode.entity.enums.RoleType.LEARNER);
        createRoleIfNotFound("CME", "Community Manager Educator", com.youcode.entity.enums.RoleType.STAFF);
        log.info("Roles seeded");
    }

    private void createRoleIfNotFound(String name, String desc, com.youcode.entity.enums.RoleType type) {
        if (roleRepository.findByName(name).isEmpty()) {
            roleRepository.save(Role.builder().name(name).description(desc).roleType(type).build());
        }
    }

    private void seedRegionsCitiesCampuses() {
        Region morocco = regionRepository.findByName("Morocco")
                .orElseGet(() -> regionRepository.save(Region.builder().name("Morocco").build()));

        // Ensure 3 Campuses
        List<String> campusNames = List.of("Safi", "Youssoufia", "Fes");
        for (String name : campusNames) {
            City city = cityRepository.findByName(name)
                    .orElseGet(() -> cityRepository.save(City.builder().name(name).region(morocco).build()));
            if (campusRepository.findByName(name).isEmpty()) {
                campusRepository.save(Campus.builder().name(name).address("YouCode " + name).city(city).build());
            }
        }
        log.info("Campuses seeded");
    }

    private void seedGrades() {
        List<String> gradeNames = List.of("SAS", "1st Year", "2nd Year", "Alumni");
        for (String name : gradeNames) {
            if (gradeRepository.findByName(name).isEmpty()) {
                gradeRepository.save(Grade.builder().name(name).description("Grade " + name).build());
            }
        }
    }

    private void seedPromotions() {
        // Ensure 7 promotions (2020-2026)
        for (int i = 0; i < 7; i++) {
            String name = "Promotion " + (2020 + i);
            if (promotionRepository.findByName(name).isEmpty()) {
                promotionRepository.save(Promotion.builder()
                        .name(name)
                        .startYear(2020 + i)
                        .endYear(2021 + i)
                        .build());
            }
        }
    }

    private void seedAbsenceTypes() {
        List<String> types = List.of("WHOLE_DAY", "HALF_DAY", "LATE");
        for (String name : types) {
            if (absenceTypeRepository.findByName(name).isEmpty()) {
                AbsenceType type = new AbsenceType();
                type.setName(name);
                type.setDescription(name + " Absence");
                absenceTypeRepository.save(type);
            }
        }
    }

    private void seedActivityTypes() {
        List<String> types = List.of("PROJECT", "WORKSHOP", "HACKATHON", "BRIEF", "DEBRIEFING", "ACTION_PLAN", "VEILLE",
                "LIVE_CODING");
        for (String name : types) {
            if (classroomActivityTypeRepository.findByName(name).isEmpty()) {
                ClassroomActivityType type = new ClassroomActivityType();
                type.setName(name);
                type.setColor(faker.color().hex());
                classroomActivityTypeRepository.save(type);
            }
        }
    }

    private void seedProgramsAndSprints() {
        List<String> programs = List.of("Java Fullstack", "JS Fullstack", "Data Science", "Mobile Dev", "DevOps",
                "AI Engineering");

        for (String title : programs) {
            if (programRepository.findByTitle(title + " Program").isEmpty()) {
                Program p = Program.builder()
                        .title(title + " Program")
                        .description("Intensive " + title + " training")
                        .speciality(title)
                        .groupId(UUID.randomUUID().toString())
                        .version(1)
                        .status("ACTIVE")
                        .build();
                p = programRepository.save(p);

                // Generate 5-9 Sprints
                int sprintCount = faker.number().numberBetween(5, 10);
                LocalDate startDate = LocalDate.now().minusMonths(6);

                for (int i = 1; i <= sprintCount; i++) {
                    Sprint s = new Sprint();
                    s.setTitle("Sprint " + i + ": " + faker.lorem().word());
                    s.setObjective(faker.lorem().sentence());
                    s.setDescription(faker.lorem().paragraph());
                    s.setStartDate(startDate);
                    s.setEndDate(startDate.plusWeeks(2));
                    s.setProgram(p);
                    s.setTechnologies(faker.lorem().words(5).toString());
                    sprintRepository.save(s);
                    startDate = startDate.plusWeeks(2).plusDays(2); // logic gap
                }
            }
        }
    }

    private void seedStaffUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").get();
        Role staffRole = roleRepository.findByName("STAFF").get();
        Role trainerRole = roleRepository.findByName("TRAINER").get();
        Role cmeRole = roleRepository.findByName("CME").get();

        // 1 Admin
        createUserIfNotFound("admin", "admin@youcode.ma", "admin123", "Admin", "User", Set.of(adminRole));

        // 20 Staff
        for (int i = 1; i <= 20; i++) {
            createUserIfNotFound("staff" + i, "staff" + i + "@youcode.ma", "password", faker.name().firstName(),
                    faker.name().lastName(), Set.of(staffRole));
        }

        // 20 Trainers
        for (int i = 1; i <= 20; i++) {
            createUserIfNotFound("trainer" + i, "trainer" + i + "@youcode.ma", "password",
                    "Tr. " + faker.name().firstName(), faker.name().lastName(), Set.of(trainerRole));
        }

        // 14 CMEs
        for (int i = 1; i <= 14; i++) {
            createUserIfNotFound("cme" + i, "cme" + i + "@youcode.ma", "password", "CME " + faker.name().firstName(),
                    faker.name().lastName(), Set.of(cmeRole));
        }
    }

    private void seedClassrooms() {
        if (classroomRepository.count() >= 40)
            return;

        List<Program> programs = programRepository.findAll();
        List<Campus> campuses = campusRepository.findAll();
        List<Promotion> promotions = promotionRepository.findAll();
        List<Grade> grades = gradeRepository.findAll();

        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("TRAINER"))).toList();
        List<User> cmes = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("CME"))).toList();

        // 40 Classrooms
        for (int i = 0; i < 40; i++) {
            String name = faker.company().name() + " Class";
            boolean isBootcamp = i < 8; // 20% of 40 = 8

            Program prog = programs.get(faker.random().nextInt(programs.size()));

            Classroom c = Classroom.builder()
                    .name(name)
                    .description(faker.lorem().sentence())
                    .program(prog)
                    .bootcamp(isBootcamp)
                    .active(true)
                    .campus(campuses.get(faker.random().nextInt(campuses.size())))
                    .promotion(promotions.get(faker.random().nextInt(promotions.size())))
                    .grade(grades.get(faker.random().nextInt(grades.size())))
                    .trainer(trainers.get(faker.random().nextInt(trainers.size())))
                    .cme(cmes.get(faker.random().nextInt(cmes.size())))
                    .startDate(LocalDate.now().minusMonths(faker.random().nextInt(1, 12)))
                    .endDate(LocalDate.now().plusMonths(faker.random().nextInt(1, 6)))
                    .build();

            classroomRepository.save(c);
        }
    }

    private void seedLearnersAndEnrollments() {
        Role learnerRole = roleRepository.findByName("LEARNER").get();
        Status activeStatus = statusRepository.findByName("ACTIVE").get();
        List<Classroom> classrooms = classroomRepository.findAll();

        // 800 Learners
        // Check if we need to generate
        long currentLearners = userRepository.count() - (1 + 20 + 20 + 14); // Admin + Staff + Trainers + CMEs
        if (currentLearners >= 800)
            return;

        for (int i = 1; i <= 800; i++) {
            String username = "learner" + i;
            if (userRepository.findByUsername(username).isPresent())
                continue;

            User learner = User.builder()
                    .username(username)
                    .email(faker.internet().emailAddress())
                    .password(passwordEncoder.encode("password"))
                    .firstName(faker.name().firstName())
                    .lastName(faker.name().lastName())
                    .name(faker.name().fullName()) // ensuring display name
                    .roles(Set.of(learnerRole))
                    .status(activeStatus)
                    .build();

            learner = userRepository.save(learner);

            // Enroll history (1-3 classrooms)
            int historyCount = faker.number().numberBetween(1, 4);
            Classroom currentClassroom = null;

            for (int h = 0; h < historyCount; h++) {
                Classroom cls = classrooms.get(faker.random().nextInt(classrooms.size()));
                // Avoid duplicate enrollment for same learner in same classroom
                if (enrollRepository.findByLearnerIdAndClassroomId(learner.getId(), cls.getId()).isPresent())
                    continue;

                Enroll enroll = new Enroll();
                enroll.setLearner(learner);
                enroll.setClassroom(cls);
                enroll.setEnrollDate(cls.getStartDate());

                // If last one, make it active/current
                if (h == historyCount - 1) {
                    enroll.setActive(true);
                    learner.setCurrentClassroom(cls);
                    learner.setCampus(cls.getCampus());
                    learner.setPromotion(cls.getPromotion());
                    currentClassroom = cls;
                } else {
                    enroll.setActive(false);
                    enroll.setEndDate(cls.getStartDate().plusMonths(3));
                }
                enrollRepository.save(enroll);
            }
            userRepository.save(learner); // update current info
        }
    }

    private void seedClassroomContent() {
        List<Classroom> classrooms = classroomRepository.findAll();
        List<ClassroomActivityType> actTypes = classroomActivityTypeRepository.findAll();

        for (Classroom cls : classrooms) {
            Program prog = cls.getProgram();
            if (prog == null)
                continue;
            List<Sprint> sprints = sprintRepository.findByProgramId(prog.getId());
            List<Enroll> activeEnrollments = enrollRepository.findByClassroomIdAndActiveTrue(cls.getId());

            for (Sprint sprint : sprints) {
                // Generate Squads for this Sprint in this Classroom
                // Using simple logic here instead of calling Service to avoid complex
                // dependencies in Seeder
                // Or we can assume SquadService logic if we could inject it, but Seeder usually
                // standalone

                if (squadRepository.findByClassroomIdAndSprintId(cls.getId(), sprint.getId()).isEmpty()) {
                    int squadCount = activeEnrollments.size() / 5; // ~5 per squad
                    if (squadCount == 0 && !activeEnrollments.isEmpty())
                        squadCount = 1;

                    List<User> shuffledHere = new ArrayList<>(
                            activeEnrollments.stream().map(Enroll::getLearner).toList());
                    // Helper shuffle
                    java.util.Collections.shuffle(shuffledHere);

                    for (int s = 0; s < squadCount; s++) {
                        Squad squad = new Squad();
                        squad.setName("Squad " + (s + 1) + " - " + sprint.getTitle());
                        squad.setClassroom(cls);
                        squad.setSprint(sprint);

                        // Assign members
                        int batchSize = shuffledHere.size() / squadCount;
                        int start = s * batchSize;
                        int end = (s == squadCount - 1) ? shuffledHere.size() : (s + 1) * batchSize;
                        List<User> members = shuffledHere.subList(start, end);

                        squad.setMembers(new java.util.HashSet<>(members));
                        if (!members.isEmpty())
                            squad.setScrumMaster(members.get(0));

                        squadRepository.save(squad);
                    }
                }

                // Generate Activities
                if (activityRepository
                        .findByClassroomProgramId(prog.getId(), org.springframework.data.domain.Pageable.unpaged())
                        .isEmpty()) {
                    // Activity Logic
                    // Create generic activities for program? Or per classroom instance?
                    // ActivityRepository usually stores activities per classroom instance
                    // (ClassroomActivity).
                    // Let's create specific to this classroom

                    int actCount = faker.number().numberBetween(3, 8);
                    for (int a = 0; a < actCount; a++) {
                        ClassroomActivity act = new ClassroomActivity();
                        act.setTitle(faker.lorem().sentence(3));
                        act.setDescription(faker.lorem().paragraph());
                        act.setActivityType(actTypes.get(faker.random().nextInt(actTypes.size())));
                        act.setClassroom(cls);
                        act.setSprint(sprint);
                        java.time.LocalDateTime date = sprint.getStartDate()
                                .plusDays(faker.number().numberBetween(0, 10)).atStartOfDay();
                        act.setStartDate(date);
                        act.setActivityDatetime(date);
                        act.setDeadline(date.plusDays(1));
                        act.setDuration(faker.number().numberBetween(60, 240));
                        activityRepository.save(act);
                    }
                }
            }

            // Absences
            if (activeEnrollments.isEmpty())
                continue;
            List<AbsenceType> absTypes = absenceTypeRepository.findAll();
            for (int i = 0; i < 5; i++) { // Random 5 absences per classroom
                Enroll luckyWinner = activeEnrollments.get(faker.random().nextInt(activeEnrollments.size()));
                Absence abs = new Absence();
                abs.setLearner(luckyWinner.getLearner());
                abs.setClassroom(cls);
                abs.setAbsenceDate(LocalDate.now().minusDays(faker.number().numberBetween(1, 30)));
                abs.setAbsenceType(absTypes.get(faker.random().nextInt(absTypes.size())));
                abs.setJustified(faker.bool().bool());
                absenceRepository.save(abs);
            }
        }
    }

    private void createUserIfNotFound(String username, String email, String password, String firstName, String lastName,
            Set<Role> roles) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Status activeStatus = statusRepository.findByName("ACTIVE").orElse(null);
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName(firstName)
                    .lastName(lastName)
                    .name(firstName + " " + lastName)
                    .roles(roles)
                    .status(activeStatus)
                    .build();
            userRepository.save(user);
            log.info("Seeded User: {}", username);
        }
    }

    private void seedSoftSkills() {
        log.info("Seeding Soft Skills...");
        List<String> skills = List.of("Communication", "Teamwork", "Problem Solving", "Adaptability", "Creativity",
                "Work Ethic", "Interpersonal Skills");
        for (String name : skills) {
            if (softSkillRepository.findByName(name).isEmpty()) {
                SoftSkill skill = new SoftSkill();
                skill.setName(name);
                skill.setDescription(faker.lorem().sentence());
                softSkillRepository.save(skill);
            }
        }
        log.info("Soft Skills seeded");
    }

    private void seedInterviews() {
        log.info("Seeding Interviews...");
        // Ensure Positions
        List<String> positions = List.of("Full Stack Developer", "Backend Developer", "Frontend Developer",
                "Data Analyst", "DevOps Engineer");
        List<InterviewPosition> savedPositions = new ArrayList<>();

        for (String title : positions) {
            InterviewPosition pos = interviewPositionRepository.findAll().stream()
                    .filter(p -> p.getTitle().equals(title)).findFirst()
                    .orElseGet(() -> {
                        InterviewPosition p = new InterviewPosition();
                        p.setTitle(title);
                        p.setDescription(faker.company().profession());
                        return interviewPositionRepository.save(p);
                    });
            savedPositions.add(pos);
        }

        List<SoftSkill> softSkills = softSkillRepository.findAll();
        List<User> learners = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("LEARNER")))
                .limit(50) // Seed for first 50 learners to save time
                .toList();

        for (User learner : learners) {
            // 0 to 3 interviews per learner
            int interviewCount = faker.number().numberBetween(0, 4);
            for (int i = 0; i < interviewCount; i++) {
                StudentInterview interview = new StudentInterview();
                interview.setStudent(learner);
                interview.setPosition(savedPositions.get(faker.random().nextInt(savedPositions.size())));
                // Random date in last 3 months
                interview
                        .setInterviewDate(java.time.LocalDateTime.now().minusDays(faker.number().numberBetween(1, 90)));

                // Random status
                StudentInterview.InterviewStatus[] statuses = StudentInterview.InterviewStatus.values();
                interview.setStatus(statuses[faker.random().nextInt(statuses.length)]);

                interview.setGlobalComment(faker.lorem().paragraph());

                interview = studentInterviewRepository.save(interview);

                if (interview.getStatus() == StudentInterview.InterviewStatus.COMPLETED) {
                    // Add evaluations for all soft skills
                    for (SoftSkill skill : softSkills) {
                        SoftSkillEvaluation eval = new SoftSkillEvaluation();
                        eval.setInterview(interview);
                        eval.setSoftSkill(skill);
                        eval.setScore(faker.number().numberBetween(1, 6)); // 1-5 scale
                        eval.setComment(faker.lorem().sentence());
                        softSkillEvaluationRepository.save(eval);
                    }
                }
            }
        }
        log.info("Interviews seeded");
    }
}
