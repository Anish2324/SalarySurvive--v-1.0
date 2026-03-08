package com.salarysurvive.repository;

import com.salarysurvive.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
}

//public interface <RepositoryName> extends JpaRepository<EntityClass, PrimaryKeyType> {}

//It never returns null
//It returns:
//Optional.empty() → no user
//Optional.of(user) → user found
//Avoids null pointer exception