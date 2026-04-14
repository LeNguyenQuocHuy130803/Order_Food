UserController.java - Xử lý request

Path: UserController.java
Method: getUserById(@PathVariable Long id)
UserService.java - Logic lấy user từ DB

Path: UserService.java
Method: getUserById(Long id)
UserJpaRepository.java - Query DB

Path: UserJpaRepository.java
Method: findById(Long id) (từ JpaRepository)
User.java - Entity

Path: User.java
UserResponseDto.java - DTO response

Path: UserResponseDto.java
SecurityConfig.java - Cấu hình security cho /api/users/**

Path: SecurityConfig.java
Line 41: .requestMatchers("/api/users/**").permitAll()
JwtAuthenticationFilter.java - Lọc & validate JWT

Path: JwtAuthenticationFilter.java
Method: doFilterInternal() (dòng 39 gây lỗi)
CustomAuthenticationEntryPoint.java - Xử lý auth error

Path: CustomAuthenticationEntryPoint.java
JwtService.java - Parse & validate JWT

Path: JwtService.java
Method: extractEmail() (dòng 80+)


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Request: GET /api/users/2
    ↓
SecurityFilter
    ↓
JwtAuthenticationFilter (dòng 39 → throw exception)
    ↓
SecurityConfig (check "/api/users/**" → permitAll)
    ↓
UserController.getUserById(2)
    ↓
UserService.getUserById(2)
    ↓
UserJpaRepository.findById(2)
    ↓
User entity
    ↓
UserResponseDto
