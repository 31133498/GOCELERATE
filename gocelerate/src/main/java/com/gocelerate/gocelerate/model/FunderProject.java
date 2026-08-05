package com.gocelerate.gocelerate.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// This is a join table with extra data — it represents the relationship
// "this funder has pledged X amount to this project"
// A plain @ManyToMany wouldn't let us store amountPledged, so we model it explicitly
@Entity
@Table(name = "funder_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FunderProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "funder_id", nullable = false)
    private User funder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPledged;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
