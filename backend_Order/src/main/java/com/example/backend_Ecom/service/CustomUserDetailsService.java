package com.example.backend_Ecom.service;

import java.util.ArrayList;
import java.util.List;

import com.example.backend_Ecom.entity.User;
import com.example.backend_Ecom.security.UserPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.backend_Ecom.repository.UserJpaRepository;

/**
 * Custom UserDetailsService for loading user details from database
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserJpaRepository userRepository;

    public CustomUserDetailsService(UserJpaRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user details by email
     * 
     * Note: Method name is loadUserByUsername (from Spring interface), but parameter is EMAIL not username.
     * This is intentional - we authenticate users with EMAIL + PASSWORD, not username + password.
     * Spring Security requires this method name from the UserDetailsService interface.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<GrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        });

        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
}