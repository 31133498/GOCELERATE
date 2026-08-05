package com.gocelerate.gocelerate.repository;

import com.gocelerate.gocelerate.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    // findByProjectId lets us query by the foreign key directly — no need to load the Project object first
    List<Milestone> findByProjectId(Long projectId);
}
