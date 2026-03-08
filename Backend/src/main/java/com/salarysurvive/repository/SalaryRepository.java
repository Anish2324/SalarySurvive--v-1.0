package com.salarysurvive.repository;

import com.salarysurvive.model.Salary;
import com.salarysurvive.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalaryRepository extends JpaRepository<Salary, UUID> {

    Optional<Salary> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    Optional<Salary> findByIdAndUser(UUID id, User user);

    List<Salary> findAllByUserOrderByYearDescMonthDesc(User user);
}
