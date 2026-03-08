package com.salarysurvive.service;

import com.salarysurvive.dto.SalaryRequest;
import com.salarysurvive.dto.SalaryResponse;
import com.salarysurvive.model.Salary;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryRepository salaryRepository;

    private static final String[] MONTH_NAMES = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
    };

    // =========================
    // GET ALL SALARIES
    // =========================
    public List<SalaryResponse> getAllSalaries(User user) {
        return salaryRepository
                .findAllByUserOrderByYearDescMonthDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SalaryResponse mapToResponse(Salary salary) {
        return new SalaryResponse(
                salary.getId(),
                salary.getAmount(),
                salary.getSalaryDate(),
                salary.getMonth(),
                salary.getYear(),
                MONTH_NAMES[salary.getMonth() - 1]
        );
    }

    public void addSalary(User user, SalaryRequest request) {

        // 🔥 Check if salary already exists for month/year
        boolean exists = salaryRepository
                .findByUserAndMonthAndYear(user, request.month(), request.year())
                .isPresent();

        if (exists) {
            throw new RuntimeException(
                    "Salary already added for this month and year"
            );
        }

        Salary salary = new Salary();
        salary.setAmount(request.amount());
        salary.setSalaryDate(request.salaryDate());
        salary.setMonth(request.month());
        salary.setYear(request.year());
        salary.setUser(user);

        salaryRepository.save(salary);
    }


    // =========================
    // UPDATE SALARY
    // =========================
    public void updateSalary(User user, UUID salaryId, SalaryRequest request) {

        Salary salary = salaryRepository
                .findByIdAndUser(salaryId, user)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        salary.setAmount(request.amount());
        salary.setSalaryDate(request.salaryDate());
        salary.setMonth(request.month());
        salary.setYear(request.year());

        salaryRepository.save(salary);
    }

    // =========================
    // DELETE SALARY
    // =========================
    public void deleteSalary(User user, UUID salaryId) {

        Salary salary = salaryRepository
                .findByIdAndUser(salaryId, user)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        salaryRepository.delete(salary);
    }
}

