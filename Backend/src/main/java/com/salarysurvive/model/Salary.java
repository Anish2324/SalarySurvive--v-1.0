package com.salarysurvive.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "salaries",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"user_id", "month", "year"}
                )
        }
)
@Getter
@Setter
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Double amount;
    private Integer salaryDate;
    private Integer month;
    private Integer year;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
}

