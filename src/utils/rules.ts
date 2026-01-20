import { z } from 'zod'

export const emailSchema = z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ')

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[a-z]/, 'Phải chứa ít nhất 1 chữ thường')
  .regex(/[A-Z]/, 'Phải chứa ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Phải chứa ít nhất 1 số')
  .regex(/[^a-zA-Z0-9]/, 'Phải chứa ít nhất 1 ký tự đặc biệt')

export const phoneSchema = z
  .string()
  .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''))

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc')
})

export const userCreateSchema = z
  .object({
    name: z.string().min(1, 'Họ và tên là bắt buộc'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    phoneNumber: phoneSchema,
    role: z.enum(['admin', 'staff', 'user']),
    gender: z.string(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    emailVerified: z.boolean().optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const profileSchema = z.object({
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  phoneNumber: phoneSchema,
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional()
})

export const userEditSchema = z.object({
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

export const registerSchema = z
  .object({
    username: z.string().min(1, 'Tên người dùng là bắt buộc'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    agreeTerms: z.boolean().refine(val => val === true, { message: 'Vui lòng đồng ý điều khoản' })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export type LoginSchema = z.infer<typeof loginSchema>
export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type ProfileSchema = z.infer<typeof profileSchema>
export type UserEditSchema = z.infer<typeof userEditSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
