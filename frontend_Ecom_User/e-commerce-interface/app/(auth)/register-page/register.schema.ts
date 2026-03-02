/**
 * Register Form Validation Schema
 * Using Yup for validation rules
 */

import * as yup from 'yup'

const phoneRegex = /^(\+84|0)[0-9]{9,10}$/

export const registerValidationSchema = yup.object({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Invalid email format'),

  userName: yup
    .string()
    .required('Please enter a username')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),

  password: yup
    .string()
    .required('Please enter a password')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and numbers'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),

  phoneNumber: yup
    .string()
    .required('Please enter a phone number')
    .matches(phoneRegex, 'Invalid phone number (VN: 09xxxxxxxx or +84xxxxxxxxx)'),

  agreeTerms: yup
    .boolean()
    .required('You must agree to the terms')
    .oneOf([true], 'Please agree to the terms of service'),
})

export type RegisterFormData = yup.InferType<typeof registerValidationSchema>
