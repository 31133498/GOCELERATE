package com.gocelerate.gocelerate.repository;

import com.gocelerate.gocelerate.model.FunderProject;
import com.gocelerate.gocelerate.model.Project;
import com.gocelerate.gocelerate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FunderProjectRepository extends JpaRepository<FunderProject, Long> {

    List<FunderProject> findByFunder(User funder);

    List<FunderProject> findByProject(Project project);

    Optional<FunderProject> findByFunderAndProject(User funder, Project project);
}
