package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Drink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DrinkRepository extends JpaRepository<Drink, Long> {

    boolean existsByName(String name);
}
