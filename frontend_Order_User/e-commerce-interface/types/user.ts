/**
 * User Types and Interfaces
 */

export interface AuthUser {
  id: number
  userName: string
  email: string
  roles: string[]
  avatar?: string
}

export interface UserDetail {
  id: number
  userName: string
  email: string
  roles: string[]
  avatar?: string
  phoneNumber?: string
  addresses?: Array<{
    id: number
    type: string
    address: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
  }>
  status?: string
  emailVerified?: boolean
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}
