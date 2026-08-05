package com.gocelerate.gocelerate.repository;

import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Returns all projects owned by a specific implementer user
    List<Project> findByImplementer(User implementer);

    List<Project> findByStatus(Project.Status status);
}
