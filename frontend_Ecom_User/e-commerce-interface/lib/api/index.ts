// /**
//  * API Client Selector
//  * Chọn giữa advanced (token refresh) hoặc simple (cơ bản)
//  * cái file này là để chọn lựa giữa 2 file api-client-advanced và api-client-simple, nếu muốn dùng advanced thì chỉ cần đổi mode thành 'advanced' là được, còn muốn dùng simple thì đổi thành 'simple', mặc định là 'advanced' để đảm bảo trải nghiệm người dùng tốt hơn khi token hết hạn sẽ tự động refresh mà không bị đá ra khỏi hệ thống
//  * file api-client-advanced có logic để tự động refresh token khi access token hết hạn, còn file api-client-simple thì không có logic đó, nếu dùng simple thì khi token hết hạn sẽ bị đá ra khỏi hệ thống và phải login lại, còn dùng advanced thì sẽ tự động refresh token mà không bị đá ra khỏi hệ thống, chỉ khi nào refresh token cũng hết hạn thì mới bị đá ra khỏi hệ thống
//  */

// import apiClientSimple from './api-client-simple'
// import apiClientAdvanced from './api-client-advanced'

// // Chọn mode: 'advanced' (khuyên dùng là có tự fresh token lại khi hết token ) hoặc 'simple = với file api-client-simple thì không có logic refresh token, nếu token hết hạn sẽ bị đá ra khỏi hệ thống và phải login lại, còn file api-client-advanced thì có logic để tự động refresh token khi access token hết hạn, chỉ khi nào refresh token cũng hết hạn thì mới bị đá ra khỏi hệ thống'
// const mode: 'simple' | 'advanced' = 'advanced'

// // Export tùy theo mode đã chọn
// const apiClient = mode === 'advanced' ? apiClientAdvanced : apiClientSimple

// export { apiClient }
// export default apiClient   // gọi nó trong file như useLogin.ts thì sẽ được tự động refresh token khi token hết hạn mà không bị đá ra khỏi hệ thống, còn nếu muốn dùng simple thì chỉ cần đổi mode thành 'simple' là được, còn muốn dùng advanced thì đổi thành 'advanced', mặc định là 'advanced' để đảm bảo trải nghiệm người dùng tốt hơn khi token hết hạn sẽ tự động refresh mà không bị đá ra khỏi hệ thống
