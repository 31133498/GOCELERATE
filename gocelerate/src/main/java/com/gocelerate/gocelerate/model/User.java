package com.gocelerate.gocelerate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// @Entity tells Hibernate this class is a database table
// @Table(name="users") sets the exact table name — "user" is a reserved SQL keyword, so we use "users"
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // @Id marks this field as the primary key
    // @GeneratedValue(IDENTITY) tells MySQL to auto-increment it
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    // unique=true adds a UNIQUE constraint on this column in MySQL
    @Column(unique = true, nullable = false)
    private String email;

    // @JsonIgnore prevents the password hash from ever appearing in API responses
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // @Enumerated(STRING) stores the enum name as text ("IMPLEMENTER", "FUNDER")
    // The alternative EnumType.ORDINAL stores 0/1 — avoid it because reordering
    // the enum would silently corrupt all your data
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private LocalDateTime createdAt;

    // @PrePersist runs automatically just before Hibernate saves a new record
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Role {
        IMPLEMENTER,
        FUNDER
    }
}
