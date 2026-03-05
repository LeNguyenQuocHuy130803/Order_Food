'use client'

import { useAuth } from '@/hooks/useAuth'

type Props = {}

export default function page({}: Props) {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div style={{ padding: '20px' }}>
      <h1>🏢 Dashboard Employers</h1>
      
      {isAuthenticated ? (
        <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
          <h2>✅ Đã vào được dashboard employers</h2>
          
          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <p><strong>User Info:</strong></p>
            <p>👤 Tên: <code>{user?.name}</code></p>
            <p>📧 Email: <code>{user?.email}</code></p>
            <p>🔐 Roles: <code>{user?.roles?.join(', ')}</code></p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🚪 Logout
          </button>
          
          <p style={{ marginTop: '15px', color: '#666' }}>
            💡 Click logout để kiểm tra redirect, rồi login lại để test
          </p>
        </div>
      ) : (
        <div style={{ color: 'red' }}>
          ❌ Không được phép! Bạn phải login trước!
        </div>
      )}
    </div>
  )
}