package com.example.backend_Ecom.config;

import com.example.backend_Ecom.entity.Role;
import com.example.backend_Ecom.enums.RoleName;
import com.example.backend_Ecom.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        // Tự động khởi tạo các Role mặc định nếu database chưa có
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName.name()).ifPresentOrElse(
                role -> log.debug("Role {} already exists with ID: {}", role.getName(), role.getId()),
                () -> {
                    Role newRole = new Role();
                    newRole.setName(roleName.name());
                    roleRepository.save(newRole);
                    log.info("✓ Auto-created missing role: {}", roleName.name());
                }
            );
        }
    }
}
