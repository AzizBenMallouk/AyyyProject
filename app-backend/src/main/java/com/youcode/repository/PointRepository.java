package com.youcode.repository;

import com.youcode.entity.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointRepository extends JpaRepository<Point, Long> {
    List<Point> findByLearnerId(Long learnerId);

    @Query("SELECT SUM(p.value) FROM Point p WHERE p.learner.id = :learnerId")
    Integer getTotalPointsByLearnerId(@Param("learnerId") Long learnerId);

    @Query("SELECT p.learner.id as learnerId, p.learner.name as learnerName, SUM(p.value) as totalPoints " +
            "FROM Point p GROUP BY p.learner.id, p.learner.name ORDER BY SUM(p.value) DESC")
    List<Object[]> findTopScorers();
}
