package com.youcode.config;

import com.youcode.entity.Role;
import com.youcode.entity.Permission;
import com.youcode.entity.User;
import com.youcode.entity.Classroom;
import com.youcode.entity.Grade;
import com.youcode.entity.Promotion;
import com.youcode.entity.Campus;
import com.youcode.entity.City;
import com.youcode.entity.Region;
import com.youcode.entity.Status;
import com.youcode.entity.AbsenceType;
import com.youcode.entity.ClassroomActivityType;
import com.youcode.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Database seeder - similar to Laravel seeders
 * Seeds initial data for roles and users on application startup
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
    private final ClassroomActivityTypeRepository classroomActivityTypeRepository;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            log.info("Starting database seeding...");

            // 1. Seed Permissions
            List<String> permissionNames = List.of(
                    "USER_READ", "USER_WRITE", "USER_DELETE",
                    "ROLE_READ", "ROLE_WRITE", "ROLE_DELETE",
                    "COURSE_READ", "COURSE_WRITE");

            permissionNames.forEach(name -> {
                if (permissionRepository.findByName(name).isEmpty()) {
                    Permission p = Permission.builder().name(name).build();
                    permissionRepository.save(p);
                }
            });

            // 2. Seed Statuses
            List<String> statusNames = List.of("ACTIVE", "INACTIVE", "BANNED", "SUSPENDED", "GRADUATED", "INSERTED",
                    "IN_STAGE");
            statusNames.forEach(name -> {
                if (statusRepository.findByName(name).isEmpty()) {
                    Status status = Status.builder().name(name).description("User status " + name).build();
                    statusRepository.save(status);
                }
            });

            // 3. Seed Roles
            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> roleRepository.save(
                    Role.builder().name("ADMIN").description("Administrator")
                            .roleType(com.youcode.entity.enums.RoleType.ADMINISTRATIVE).build()));
            Role staffRole = roleRepository.findByName("STAFF").orElseGet(() -> roleRepository.save(
                    Role.builder().name("STAFF").description("Staff").roleType(com.youcode.entity.enums.RoleType.STAFF)
                            .build()));
            Role trainerRole = roleRepository.findByName("TRAINER").orElseGet(() -> roleRepository.save(
                    Role.builder().name("TRAINER").description("Trainer")
                            .roleType(com.youcode.entity.enums.RoleType.STAFF).build()));
            Role learnerRole = roleRepository.findByName("LEARNER").orElseGet(() -> roleRepository.save(
                    Role.builder().name("LEARNER").description("Learner")
                            .roleType(com.youcode.entity.enums.RoleType.LEARNER).build()));

            Role cmeRole = roleRepository.findByName("CME").orElseGet(() -> roleRepository.save(
                    Role.builder().name("CME").description("Community Manager Educator")
                            .roleType(com.youcode.entity.enums.RoleType.STAFF).build()));

            log.info("Roles seeded successfully");

            // 4. Seed Regions & Cities & Campuses (Moved UP)
            Region morocco = regionRepository.findByName("Morocco")
                    .orElseGet(() -> regionRepository.save(Region.builder().name("Morocco").build()));
            List<String> campusNames = List.of("Safi", "Youssoufia", "Nador", "Fes");

            for (String name : campusNames) {
                City city = cityRepository.findByName(name)
                        .orElseGet(() -> cityRepository.save(City.builder().name(name).region(morocco).build()));
                if (campusRepository.findByName(name).isEmpty()) {
                    campusRepository.save(Campus.builder().name(name).address("YouCode " + name).city(city).build());
                    log.info("Seeded Campus: {}", name);
                }
            }
            List<Campus> allCampuses = campusRepository.findAll();

            // 5. Seed Grades & Promotions (Moved UP)
            List<String> gradeNames = List.of("SAS", "A1", "A2");
            gradeNames.forEach(name -> {
                if (gradeRepository.findByName(name).isEmpty()) {
                    gradeRepository.save(Grade.builder().name(name).description("Grade " + name).build());
                }
            });
            List<Grade> allGrades = gradeRepository.findAll();

            for (int i = 1; i <= 3; i++) {
                String promoName = "Promotion 202" + (3 + i);
                if (promotionRepository.findByName(promoName).isEmpty()) {
                    promotionRepository
                            .save(Promotion.builder().name(promoName).startYear(2023 + i).endYear(2024 + i).build());
                }
            }
            List<Promotion> allPromotions = promotionRepository.findAll();
            Promotion latestPromo = allPromotions.get(allPromotions.size() - 1);

            // 6. Seed Users (Admin, Staff, Trainers)
            createUserIfNotFound("admin", "admin@youcode.com", "admin123", "Admin", "User", Set.of(adminRole));
            createUserIfNotFound("staff", "staff@youcode.com", "staff123", "Staff", "User", Set.of(staffRole));

            for (int i = 1; i <= 5; i++) {
                createUserIfNotFound("trainer" + i, "trainer" + i + "@youcode.ma", "password", "Trainer",
                        String.valueOf(i), Set.of(trainerRole));
            }

            // Seed CME
            createUserIfNotFound("cme1", "cme1@youcode.ma", "password", "CME", "User", Set.of(cmeRole));

            List<User> allTrainers = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("TRAINER")))
                    .toList();

            // 7. Seed Classrooms
            List<String> specialities = List.of("PHP/Laravel", "AI", "JAVA/Spring", "MERN", "Data");
            if (!allGrades.isEmpty() && !allCampuses.isEmpty() && !allTrainers.isEmpty()) {
                for (int i = 0; i < 10; i++) { // Seed 10 classrooms
                    String spec = specialities.get(i % specialities.size());
                    String classroomName = spec + " Class " + (i + 1);

                    if (classroomRepository.findByName(classroomName).isEmpty()) {
                        Campus campus = allCampuses.get(i % allCampuses.size());
                        Grade grade = allGrades.get(i % allGrades.size());

                        Classroom classroom = Classroom.builder()
                                .name(classroomName)
                                .description("Bootcamp for " + spec)
                                .speciality(spec)
                                .bootcamp(true)
                                .active(true)
                                .grade(grade)
                                .campus(campus)
                                .promotion(latestPromo)
                                .trainer(allTrainers.get(i % allTrainers.size()))
                                .startDate(LocalDate.now())
                                .endDate(LocalDate.now().plusMonths(6))
                                .build();
                        classroomRepository.save(classroom);
                        log.info("Seeded Classroom: {}", classroomName);
                    }
                }
            }
            List<Classroom> allClassrooms = classroomRepository.findAll();

            // 8. Seed Learners (Students)
            Status activeStatus = statusRepository.findByName("ACTIVE").orElse(null);

            for (int i = 1; i <= 50; i++) {
                String username = "learner" + i;
                if (userRepository.findByUsername(username).isEmpty()) {
                    // Assign to random classroom
                    Classroom classroom = allClassrooms.isEmpty() ? null : allClassrooms.get(i % allClassrooms.size());

                    User learner = User.builder()
                            .username(username)
                            .email(username + "@youcode.ma")
                            .password(passwordEncoder.encode("password"))
                            .firstName("Learner")
                            .lastName(String.valueOf(i))
                            .name("Learner " + i)
                            .roles(Set.of(learnerRole))
                            .status(activeStatus)
                            .currentClassroom(classroom)
                            .campus(classroom != null ? classroom.getCampus() : null)
                            .promotion(classroom != null ? classroom.getPromotion() : null)
                            // grade is derived from classroom usually, but if User has grade field we could
                            // set it but User entity doesn't have direct grade field, only via classroom
                            .build();

                    userRepository.save(learner);
                }
            }
            // 9. Seed Absence Types
            List<String> absenceTypes = List.of("WHOLE_DAY", "HALF_DAY", "LATE");
            absenceTypes.forEach(name -> {
                if (absenceTypeRepository.findByName(name).isEmpty()) {
                    AbsenceType type = new AbsenceType();
                    type.setName(name);
                    switch (name) {
                        case "WHOLE_DAY" -> type.setDescription("Absent for the whole day (Red)");
                        case "HALF_DAY" -> type.setDescription("Absent for half day (Orange)");
                        case "LATE" -> type.setDescription("Late arrival (Yellow)");
                    }
                    absenceTypeRepository.save(type);
                    log.info("Seeded AbsenceType: {}", name);
                }
            });

            // 10. Seed Classroom Activity Types
            List<String> activityTypes = List.of("PROJECT", "WORKSHOP", "HACKATHON");
            activityTypes.forEach(name -> {
                if (classroomActivityTypeRepository.findByName(name).isEmpty()) {
                    ClassroomActivityType type = new ClassroomActivityType();
                    type.setName(name);
                    type.setColor(switch (name) {
                        case "PROJECT" -> "#3b82f6"; // Blue
                        case "WORKSHOP" -> "#10b981"; // Green
                        case "HACKATHON" -> "#8b5cf6"; // Purple
                        default -> "#64748b";
                    });
                    classroomActivityTypeRepository.save(type);
                    log.info("Seeded ClassroomActivityType: {}", name);
                }
            });

            log.info("Database seeding completed successfully.");
        };
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
}
