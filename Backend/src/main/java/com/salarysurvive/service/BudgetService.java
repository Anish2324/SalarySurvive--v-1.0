package com.salarysurvive.service;

import com.salarysurvive.dto.BudgetHistoryResponse;
import com.salarysurvive.dto.BudgetRequest;
import com.salarysurvive.dto.BudgetResponse;
import com.salarysurvive.model.CategoryBudget;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.CategoryBudgetRepository;
import com.salarysurvive.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final CategoryBudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    // Set / Update Budget
    public void setBudget(User user, BudgetRequest request) {

        CategoryBudget budget = budgetRepository
                .findByUserAndCategoryAndMonthAndYear(
                        user,
                        request.category(),
                        request.month(),
                        request.year()
                )
                .orElse(new CategoryBudget());

        budget.setUser(user);
        budget.setCategory(request.category());
        budget.setLimitAmount(request.limitAmount());
        budget.setMonth(request.month());
        budget.setYear(request.year());

        budgetRepository.save(budget);
    }

    // Get All Budgets (History)
    public List<BudgetHistoryResponse> getAllBudgets(User user) {
        return budgetRepository.findAllByUserOrderByYearDescMonthDesc(user)
                .stream()
                .map(b -> new BudgetHistoryResponse(
                        b.getId(),
                        b.getCategory(),
                        b.getLimitAmount(),
                        b.getMonth(),
                        b.getYear(),
                        b.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // Update Budget by ID
    public void updateBudget(User user, UUID id, BudgetRequest request) {
        CategoryBudget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));

        budget.setCategory(request.category());
        budget.setLimitAmount(request.limitAmount());
        budget.setMonth(request.month());
        budget.setYear(request.year());

        budgetRepository.save(budget);
    }

    // Delete Budget by ID
    public void deleteBudget(User user, UUID id) {
        CategoryBudget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        budgetRepository.delete(budget);
    }

    // Get Budget Status for a specific month/year (with spent amount, exceeded flag)
    public List<BudgetResponse> getBudgetStatus(User user, int month, int year) {
        List<CategoryBudget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);

        List<Object[]> spentData = expenseRepository.sumByCategoryForMonthAndYear(user, month, year);
        Map<String, Double> spentMap = new HashMap<>();
        for (Object[] row : spentData) {
            spentMap.put((String) row[0], ((Number) row[1]).doubleValue());
        }

        return budgets.stream().map(b -> {
            double spent = spentMap.getOrDefault(b.getCategory(), 0.0);
            double limit = b.getLimitAmount();
            boolean exceeded = spent > limit;
            double exceededBy = exceeded ? spent - limit : 0.0;
            return new BudgetResponse(b.getCategory(), limit, spent, exceeded, exceededBy);
        }).collect(Collectors.toList());
    }
}
