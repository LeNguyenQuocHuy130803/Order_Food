package com.example.backend_Ecom.security;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom UserPrincipal to store user ID in authentication token
 * Allows easy access to user ID from Authentication object in controllers
 */
@Getter
@Setter
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String password, 
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Spring Security uses username, we use email
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals(role) || 
                                 auth.getAuthority().equals("ROLE_" + role));
    }
}
