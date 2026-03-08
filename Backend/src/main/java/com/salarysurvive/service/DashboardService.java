package com.salarysurvive.service;

import com.salarysurvive.dto.MonthlySummaryResponse;
import com.salarysurvive.dto.MonthlyTrendResponse;
import com.salarysurvive.dto.TopCategoryResponse;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.ExpenseRepository;
import com.salarysurvive.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SalaryRepository salaryRepository;
    private final ExpenseRepository expenseRepository;

    // ==============================
    // 1️⃣ Monthly Summary
    // ==============================
    public MonthlySummaryResponse getMonthlySummary(
            User user,
            Integer month,
            Integer year
    ) {

        var salaries = salaryRepository
                .findByUserAndMonthAndYear(user, month, year);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        var expenses = expenseRepository
                .findByUserAndExpenseDateBetween(user, startDate, endDate);

        double totalSalary = salaries.stream()
                .mapToDouble(s -> s.getAmount())
                .sum();

        double totalExpense = expenses.stream()
                .mapToDouble(e -> e.getAmount())
                .sum();

        double remainingBalance = totalSalary - totalExpense;

        double savingsRate = totalSalary == 0
                ? 0
                : (remainingBalance / totalSalary) * 100;

        double expenseRatio = totalSalary == 0
                ? 0
                : (totalExpense / totalSalary) * 100;

        int healthScore = calculateHealthScore(savingsRate);

        Map<String, Double> categoryBreakdown =
                expenses.stream()
                        .collect(Collectors.groupingBy(
                                e -> e.getCategory(),
                                Collectors.summingDouble(e -> e.getAmount())
                        ));

        return new MonthlySummaryResponse(
                totalSalary,
                totalExpense,
                remainingBalance,
                savingsRate,
                expenseRatio,
                healthScore,
                categoryBreakdown
        );
    }

    // ==============================
    // 2️⃣ Last 6 Months Trend
    // ==============================
    public List<MonthlyTrendResponse> getLastSixMonthsTrend(User user) {

        List<MonthlyTrendResponse> trend = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {

            LocalDate date = now.minusMonths(i);

            int month = date.getMonthValue();
            int year = date.getYear();

            var salaries = salaryRepository
                    .findByUserAndMonthAndYear(user, month, year);

            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

            var expenses = expenseRepository
                    .findByUserAndExpenseDateBetween(user, start, end);

            double totalSalary = salaries.stream()
                    .mapToDouble(s -> s.getAmount())
                    .sum();

            double totalExpense = expenses.stream()
                    .mapToDouble(e -> e.getAmount())
                    .sum();

            double balance = totalSalary - totalExpense;

            trend.add(new MonthlyTrendResponse(
                    month,
                    year,
                    totalSalary,
                    totalExpense,
                    balance
            ));
        }

        return trend;
    }

    // ==============================
    // 3️⃣ Top 3 Spending Categories
    // ==============================
    public List<TopCategoryResponse> getTopSpendingCategories(User user) {

        var expenses = expenseRepository.findByUser(user);

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory(),
                        Collectors.summingDouble(e -> e.getAmount())
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(3)
                .map(entry -> new TopCategoryResponse(
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();
    }

    // ==============================
    // 4️⃣ Financial Health Score
    // ==============================
    private int calculateHealthScore(double savingsRate) {

        if (savingsRate > 30) return 95;
        if (savingsRate > 15) return 80;
        if (savingsRate > 0) return 60;
        return 30;
    }
}
