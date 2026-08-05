package com.gocelerate.gocelerate.repository;

import com.gocelerate.gocelerate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// @Repository marks this as a Spring-managed data-access component
// Optional<User> means the result might be empty — forces callers to handle the "not found" case
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
