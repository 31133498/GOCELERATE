package com.gocelerate.gocelerate.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each expense belongs to exactly one milestone
    // When a funder views expenses, they can trace: expense → milestone → project
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // e.g. "Transport", "Equipment", "Salaries" — free text for now, could become an enum
    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime loggedAt;

    @PrePersist
    protected void onCreate() {
        loggedAt = LocalDateTime.now();
    }
}
