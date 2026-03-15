
import * as yup from 'yup'

export const SchemaLogin = yup.object({
  email: yup
    .string()
    .required('Please enter your email!')
    .email('Invalid email format'),

  password: yup
    .string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be less than 50 characters'),
})

export type LoginFormData = yup.InferType<typeof SchemaLogin>
