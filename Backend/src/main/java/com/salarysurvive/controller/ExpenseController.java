package com.salarysurvive.controller;

import com.salarysurvive.dto.ExpenseRequest;
import com.salarysurvive.dto.ExpenseResponse;
import com.salarysurvive.model.Expense;
import com.salarysurvive.model.User;
import com.salarysurvive.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> addExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExpenseRequest request
    ) {
        expenseService.addExpense(user, request);
        return ResponseEntity.ok("Expense added successfully");
    }
//    Why @Valid?
//It tells Spring:
//"Before entering this method, validate the request."

    @GetMapping
    public List<ExpenseResponse> getExpenses(@AuthenticationPrincipal User user) {
        return expenseService.getUserExpenses(user);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody ExpenseRequest request
    ) {
        return expenseService.updateExpense(id, user, request);
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        expenseService.deleteExpense(id, user);
        return "Expense deleted successfully";
    }




}


//Why /api is used?
//Instead:
/// expenses        → webpage
/// api/expenses    → JSON API
//Clean separation ✅

//Separate Backend from Frontend