package com.salarysurvive.controller;

import com.salarysurvive.dto.BudgetHistoryResponse;
import com.salarysurvive.dto.BudgetRequest;
import com.salarysurvive.dto.BudgetResponse;
import java.util.List;
import java.util.UUID;
import com.salarysurvive.model.User;
import com.salarysurvive.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public String setBudget(
            @AuthenticationPrincipal User user,
            @RequestBody BudgetRequest request
    ) {
        budgetService.setBudget(user, request);
        return "Budget set successfully";
    }

    @GetMapping("/history")
    public List<BudgetHistoryResponse> getBudgetHistory(
            @AuthenticationPrincipal User user
    ) {
        return budgetService.getAllBudgets(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBudget(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody BudgetRequest request
    ) {
        budgetService.updateBudget(user, id, request);
        return ResponseEntity.ok("Budget updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        budgetService.deleteBudget(user, id);
        return ResponseEntity.ok("Budget deleted successfully");
    }

    @GetMapping("/status")
    public List<BudgetResponse> getBudgetStatus(
            @AuthenticationPrincipal User user,
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        return budgetService.getBudgetStatus(user, month, year);
    }
}
