package com.salarysurvive.service;

import com.salarysurvive.dto.ExpenseRequest;
import com.salarysurvive.dto.ExpenseResponse;
import com.salarysurvive.model.Expense;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public void addExpense(User user, ExpenseRequest request) {

        Expense expense = Expense.builder()
                .title(request.title())
                .amount(request.amount())
                .category(request.category())
                .expenseDate(request.expenseDate())
                .user(user)
                .build();

        expenseRepository.save(expense);
    }

    public List<ExpenseResponse> getUserExpenses(User user) {
        return expenseRepository.findByUser(user)
                .stream()
                .map(expense -> new ExpenseResponse(
                        expense.getId(),
                        expense.getTitle(),
                        expense.getAmount(),
                        expense.getCategory(),
                        expense.getExpenseDate(),
                        expense.getCreatedAt()
                ))
                .toList();
    }

    //4️⃣ .stream()
    //This converts:List<Expense>into:Stream<Expense>

    //Stream allows:
    //filtering
    //mapping
    //transforming
    //processing
    //
    //Think of it like Processing pipeline.

    //🔹 5️⃣ .map(...)
    //
    //This is the most important part.
    //map means: Convert each element into something else.
    //
    //So here:Expense → ExpenseResponse
    //For every expense object,you create a new ExpenseResponse.


    public ExpenseResponse updateExpense(UUID expenseId, User user, ExpenseRequest request) {

        Expense expense = expenseRepository
                .findByIdAndUser(expenseId, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setTitle(request.title());
        expense.setAmount(request.amount());
        expense.setCategory(request.category());
        expense.setExpenseDate(request.expenseDate());

        Expense savedExpense = expenseRepository.save(expense);

        return new ExpenseResponse(
                savedExpense.getId(),
                savedExpense.getTitle(),
                savedExpense.getAmount(),
                savedExpense.getCategory(),
                savedExpense.getExpenseDate(),
                savedExpense.getCreatedAt()
        );
    }
    //While Updating — Should You Send Whole Data?
    //Short Answer:
    //👉 Yes, if you are using PUT.
    //👉 No, if you are using PATCH


    public void deleteExpense(UUID expenseId, User user) {

        Expense expense = expenseRepository
                .findByIdAndUser(expenseId, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseRepository.delete(expense);
    }



}


