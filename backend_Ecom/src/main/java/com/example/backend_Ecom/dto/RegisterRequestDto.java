package com.example.backend_Ecom.dto;

import lombok.Getter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


@Getter
public class RegisterRequestDto {

    @NotBlank(message = "Email cannot be empty")
    private String email;

    @NotBlank(message = "Username cannot be empty")
    private String userName;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern( regexp = "\\d{10}", message = "Số điện thoại không hợp lệ ")
    private String phoneNumber;


    // muốn hiện được các anotation này : như @NotBlank hoặc @Pattern ... thì phải có @Valid ở file controller và nếu chỉ có thể thì khi test ở postman nó sẽ trả về 
    //  dữ liệu chưa được định dạngg kiểu dài dòng nên cần phải cấu hình ở file GlobalExceptionHandler khi nó tra về 400 thì in ra lỗi chi tiết hơn để dễ debug hơn
}
