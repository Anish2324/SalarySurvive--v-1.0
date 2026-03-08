package com.salarysurvive.repository;

import com.salarysurvive.model.CategoryBudget;
import com.salarysurvive.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, UUID> {

    Optional<CategoryBudget> findByUserAndCategoryAndMonthAndYear(
            User user,
            String category,
            Integer month,
            Integer year
    );

    List<CategoryBudget> findByUserAndMonthAndYear(
            User user,
            Integer month,
            Integer year
    );

    List<CategoryBudget> findAllByUserOrderByYearDescMonthDesc(User user);
}
