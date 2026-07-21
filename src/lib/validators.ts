import { z } from 'zod'

const passwordPolicy = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol')

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+?[1-9]\d{6,14}|0\d{9})$/, 'Invalid phone number'),
  password: passwordPolicy,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores and hyphens'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .regex(/^(\+?[1-9]\d{6,14}|0\d{9})$/, 'Invalid phone number')
    .optional(),
  password: z.string().min(1, 'Password is required'),
})

export const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000),
  price: z.number().min(0, 'Price cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  locationId: z.string().min(1, 'Location is required'),
  condition: z.enum(['New', 'Used', 'Refurbished']).default('Used'),
  isNegotiable: z.boolean().default(false),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z
    .string()
    .regex(/^(\+?[1-9]\d{6,14}|0\d{9})$/, 'Invalid phone number'),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
      })
    )
    .max(10, 'Maximum 10 images allowed')
    .optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
  listingId: z.string().optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  conversationId: z.string().min(1, 'Conversation ID is required'),
  listingId: z.string().optional(),
  type: z.enum(['text', 'image', 'file', 'listing_share']).default('text'),
  mediaUrl: z.string().url().optional(),
})

export const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).optional(),
  sort: z
    .enum(['newest', 'price-asc', 'price-desc', 'popular'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number').optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordPolicy,
  userId: z.string().optional(),
})

export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export const twoFactorSchema = z.object({
  code: z.string().length(6, '2FA code must be 6 digits'),
  tempToken: z.string().min(1, 'Session token is required'),
})

export const resendCodeSchema = z.object({
  type: z.enum(['email', 'phone']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ListingInput = z.infer<typeof listingSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type TwoFactorInput = z.infer<typeof twoFactorSchema>
