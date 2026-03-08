package com.salarysurvive.dto;

public record RegisterRequest(
        String name,
        String email,
        String password
) {}

//A record is a special type of class in Java used to store data only.

//But with record…
//Java automatically generates:
//✅ constructor
//✅ getters
//✅ toString()
//✅ equals()
//✅ hashCode()

//| Normal Class             | Record                |
//| ------------------------ | --------------------- |
//| Mutable                  | Immutable             |
//| You write constructor    | Auto constructor      |
//| Write getters            | Auto getters          |
//| Can extend other classes | Cannot extend (final) |
//| Used for logic           | Used for data         |