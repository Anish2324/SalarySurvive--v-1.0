package com.salarysurvive.repository;

import com.salarysurvive.model.Expense;
import com.salarysurvive.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    // Get all expenses of a user
    List<Expense> findByUser(User user);

    Optional<Expense> findByIdAndUser(UUID id, User user);
//    Used when you want to:
//    Update expense,Delete expense

    List<Expense> findByUserAndExpenseDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    // Sum expenses per category for a specific month and year
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
            "WHERE e.user = :user " +
            "AND MONTH(e.expenseDate) = :month " +
            "AND YEAR(e.expenseDate) = :year " +
            "GROUP BY e.category")
    List<Object[]> sumByCategoryForMonthAndYear(
            @Param("user") User user,
            @Param("month") int month,
            @Param("year") int year
    );

}

//Why not just use findById(id)?
//Because: If you use: findById(id)
//User A could access User B's expense if they know the UUID.
//
//But this:findByIdAndUser(id, loggedInUser)
//✔ Ensures expense belongs to logged-in user
//✔ Prevents hacking
//✔ Industry-standard security practice