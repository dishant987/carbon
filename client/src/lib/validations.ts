import { z } from 'zod';

/** Validates the activity form input on the client side */
export const activityFormSchema = z.object({
  type: z.enum(['transport', 'food', 'energy', 'shopping'], {
    required_error: 'Please select an activity type',
  }),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be under 100 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be under 20 characters'),
  date: z.string().optional(),
});

export type ActivityFormSchemaType = z.infer<typeof activityFormSchema>;
