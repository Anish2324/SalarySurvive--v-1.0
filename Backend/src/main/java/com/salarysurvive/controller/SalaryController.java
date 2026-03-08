package com.salarysurvive.controller;

import com.salarysurvive.dto.SalaryRequest;
import com.salarysurvive.dto.SalaryResponse;
import com.salarysurvive.model.User;
import com.salarysurvive.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    // =========================
    // GET ALL SALARIES
    // =========================
    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public List<SalaryResponse> getAllSalaries(
            @AuthenticationPrincipal User user
    ) {
        return salaryService.getAllSalaries(user);
    }

    // =========================
    // ADD SALARY
    // =========================
    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public String addSalary(
            @AuthenticationPrincipal User user,
            @RequestBody SalaryRequest request
    ) {
        salaryService.addSalary(user, request);
        return "Salary added successfully";
    }

    // =========================
    // UPDATE
    // =========================
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{id}")
    public String updateSalary(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody SalaryRequest request
    ) {
        salaryService.updateSalary(user, id, request);
        return "Salary updated successfully";
    }

    // =========================
    // DELETE
    // =========================
    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{id}")
    public String deleteSalary(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        salaryService.deleteSalary(user, id);
        return "Salary deleted successfully";
    }
}

//What is @AuthenticationPrincipal?
//👉 It gives you the currently logged-in user.
//
//Spring Security already knows who is logged in.
//@AuthenticationPrincipal simply fetches that user for you.