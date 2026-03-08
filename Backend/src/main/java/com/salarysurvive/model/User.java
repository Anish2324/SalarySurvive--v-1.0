package com.salarysurvive.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "app_users")
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private String role;   // ROLE_USER / ROLE_ADMIN

    // ===== UserDetails methods =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }



    @Override
    public String getUsername() {
        return email; // JWT uses email
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}



//“This user has exactly one role, and that role is USER.”
//
//🧠 Real-life example
//Think of a college ID card:
//getAuthorities() → asks
//“What access does this student have?”
//ROLE_USER →“Normal student access"
//? = unknown type

//3️⃣ Collection<? extends GrantedAuthority>
//This is the return type. Break it down 👇
//Spring expects multiple authorities (roles/permissions)
//
//🔹 GrantedAuthority
//Represents one permission or role
//Example:
//ROLE_USER
//ROLE_ADMIN
//
//🔹 ? extends GrantedAuthority
//Means:
//“Any object that is a GrantedAuthority or a child of it”
//👉 This gives flexibility (List, Set, etc.)

//“These fields are already declared using annotations.
// Why do we again write getUsername() and getPassword()?”
//🔹 What Spring Security is asking for

//Your class implements:
//implements UserDetails
//That interface forces these methods:
//
//String getUsername();
//String getPassword();
//Collection<? extends GrantedAuthority> getAuthorities();
//boolean isAccountNonExpired();
//boolean isAccountNonLocked();
//boolean isCredentialsNonExpired();
//boolean isEnabled();
//
//
//⚠️ Spring Security does NOT look at fields
//⚠️ Spring Security does NOT care about Lombok
//
//It only calls:
//
//userDetails.getUsername();
//userDetails.getPassword();
//
//🔥 Why Lombok is NOT enough here
//Lombok generates:
//getEmail()
//getPassword()
//
//
//But Spring Security wants:
//getUsername()   ❌ (NOT getEmail)
//So we must map email → username manually.
//
//🔹 This is why this method is REQUIRED
//@Override
//public String getUsername() {
//    return email;  // 👈 tell Spring: email IS username
//}
//
//
//Without this:
//
//Spring Security does not know what “username” is
//JWT validation fails
//Authentication fails
//You get 401
//
//🔹 Why we override getPassword() explicitly
//Even though Lombok generates it, we override it to:
//Explicitly satisfy UserDetails
//Avoid ambiguity
//Make security logic clear
//Spring Security is interface-driven, not annotation-driven.