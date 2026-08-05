package com.gocelerate.gocelerate.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // columnDefinition = "TEXT" maps to MySQL's TEXT type (up to 65,535 chars)
    // The default VARCHAR(255) would be too small for project descriptions
    @Column(columnDefinition = "TEXT")
    private String description;

    // BigDecimal is mandatory for money — float/double have rounding errors
    // e.g., 0.1 + 0.2 = 0.30000000000000004 in floating point
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal targetBudget;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    // @ManyToOne = many Projects can belong to one User (the implementer)
    // @JoinColumn(name="implementer_id") creates a foreign key column called implementer_id
    // This column in the projects table points to the users table's id column
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "implementer_id", nullable = false)
    private User implementer;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = Status.PENDING;
    }

    public enum Status {
        PENDING,
        ACTIVE,
        COMPLETED
    }
}
