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
    role: z.coerce.number().min(1, 'Vui lòng chọn vai trò'),
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

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  categoryId: z.coerce.number().min(1, 'Danh mục là bắt buộc'),
  price: z.coerce.number().min(1000, 'Giá phải lớn hơn 1.000 VNĐ').max(1000000000, 'Giá quá lớn'),
  stock: z.coerce.number().min(0, 'Số lượng không được âm').int('Số lượng phải là số nguyên'),
  rating: z.coerce.number().min(0).max(5).default(0),
  description: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  status: z.enum(['active', 'inactive']).default('active'),

  // Images will be handled separately in the form, but we can validate logic if needed
  image: z.string().optional()
})

export type UserCreateSchema = z.infer<typeof userCreateSchema>
export type ProfileSchema = z.infer<typeof profileSchema>
export type UserEditSchema = z.infer<typeof userEditSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ProductSchema = z.infer<typeof productSchema>

export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(100, 'Tên danh mục không được quá 100 ký tự'),
  description: z.string().max(1000, 'Mô tả không được quá 1000 ký tự').optional(),

  // Image handling in form
  image: z
    .union([z.instanceof(File), z.string()])
    .optional()
    .nullable()
})

export type CategorySchema = z.infer<typeof categorySchema>

export const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên vai trò phải có ít nhất 2 ký tự')
    .max(50, 'Tên vai trò không được quá 50 ký tự')
    .regex(/^[a-z_]+$/, 'Tên vai trò chỉ được chứa chữ thường và dấu gạch dưới'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
})

export type RoleSchema = z.infer<typeof roleSchema>

export const permissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên quyền hạn phải có ít nhất 2 ký tự')
    .max(100, 'Tên quyền hạn không được quá 100 ký tự')
    .regex(/^[a-z_]+$/, 'Tên quyền hạn chỉ được chứa chữ thường và dấu gạch dưới'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
})

export type PermissionSchema = z.infer<typeof permissionSchema>

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Mã voucher phải có ít nhất 3 ký tự')
      .max(50, 'Mã voucher không được vượt quá 50 ký tự')
      .regex(/^[A-Z0-9\-_]+$/, 'Mã voucher chỉ gồm A-Z, 0-9, gạch ngang hoặc gạch dưới')
      .transform(val => val.toUpperCase().trim()),
    type: z.enum(['percent', 'fixed'] as const),
    amount: z.coerce.number().positive('Giá trị giảm phải lớn hơn 0'),
    maxDiscount: z.coerce.number().min(0, 'Giảm tối đa không được âm').optional().nullable(),
    minOrderValue: z.coerce.number().min(0, 'Giá trị đơn tối thiểu không được âm').optional().nullable(),
    usageLimit: z.coerce
      .number()
      .int('Giới hạn sử dụng phải là số nguyên')
      .min(0, 'Giới hạn sử dụng không được âm')
      .optional()
      .nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    description: z.string().optional().nullable()
  })
  .refine(
    data => {
      if (data.type === 'percent' && Number(data.amount) > 100) {
        return false
      }

      return true
    },
    {
      message: 'Giá trị phần trăm không được vượt quá 100%',
      path: ['amount']
    }
  )
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate)
      }

      return true
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['endDate']
    }
  )

export type VoucherSchema = z.infer<typeof voucherSchema>
