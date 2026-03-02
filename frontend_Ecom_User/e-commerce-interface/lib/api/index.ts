/**
 * API Client Selector
 * Chọn giữa advanced (token refresh) hoặc simple (cơ bản)
 */

import apiClientSimple from './api-client-simple'
import apiClientAdvanced from './api-client-advanced'

// Chọn mode: 'advanced' (khuyên dùng) hoặc 'simple'
const mode: 'simple' | 'advanced' = 'advanced'

// Export tùy theo mode đã chọn
const apiClient = mode === 'advanced' ? apiClientAdvanced : apiClientSimple

export { apiClient }
export default apiClient
