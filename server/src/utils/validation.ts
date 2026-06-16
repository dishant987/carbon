import { z } from 'zod';

/** Validates activity creation input */
export const activitySchema = z.object({
  type: z.enum(['transport', 'food', 'energy', 'shopping'], {
    errorMap: () => ({ message: 'Type must be transport, food, energy, or shopping' }),
  }),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be under 100 characters'),
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be under 20 characters'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
    .optional(),
});

/** Validates date range query parameters */
export const dateRangeSchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
    .max(10),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
    .max(10),
});

/** Validates user registration input */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().max(100, 'Name must be under 100 characters').optional(),
});

/** Validates user login input */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password must be under 128 characters'),
});

/** Validates chat message input */
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be under 2000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'bot']),
        content: z.string().max(5000),
      })
    )
    .max(100, 'History exceeds maximum length')
    .optional(),
});

/** Inferred types from schemas */
export type ActivitySchemaType = z.infer<typeof activitySchema>;
export type DateRangeSchemaType = z.infer<typeof dateRangeSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ChatMessageSchemaType = z.infer<typeof chatMessageSchema>;
