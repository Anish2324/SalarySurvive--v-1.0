package com.salarysurvive.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    private Double amount;

    private String category;

    private LocalDate expenseDate;

    private LocalDateTime createdAt;

    // 🔗 Many expenses belong to one user
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}


//@PrePersist → Runs code automatically before saving entity to DB.
//It runs a method before the entity is saved to the database.

//@Builder is a Lombok annotation that implements the Builder
// design pattern to create objects in a readable and flexible way