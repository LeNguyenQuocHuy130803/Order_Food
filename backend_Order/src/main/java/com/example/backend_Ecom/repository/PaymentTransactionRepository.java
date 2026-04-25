package com.example.backend_Ecom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend_Ecom.entity.PaymentTransaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    // Tìm transaction theo mã giao dịch
    Optional<PaymentTransaction> findByTxnRef(String txnRef);

    // Tìm tất cả transaction của user
    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Check xem txnRef đã tồn tại chưa (để tránh duplicate)
    boolean existsByTxnRef(String txnRef);
}