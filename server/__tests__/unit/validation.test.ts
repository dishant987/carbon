import { activitySchema, registerSchema, loginSchema, dateRangeSchema, chatMessageSchema } from '../../src/utils/validation';

describe('Validation Schemas', () => {
  describe('activitySchema', () => {
    it('accepts a valid activity input', () => {
      const input = { type: 'transport', category: 'car', amount: 10, unit: 'km' };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts an activity with an optional date', () => {
      const input = { type: 'food', category: 'beef', amount: 0.5, unit: 'kg', date: '2024-01-15' };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid activity type', () => {
      const input = { type: 'space', category: 'rocket', amount: 1, unit: 'km' };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('transport, food, energy, or shopping');
      }
    });

    it('rejects a negative amount', () => {
      const input = { type: 'energy', category: 'electricity', amount: -5, unit: 'kWh' };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive');
      }
    });

    it('rejects an empty category', () => {
      const input = { type: 'shopping', category: '', amount: 1, unit: 'items' };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a missing required field', () => {
      const input = { type: 'transport', amount: 10 };
      const result = activitySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const input = { email: 'user@example.com', password: 'StrongPass1', name: 'Alice' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects a weak password (no uppercase)', () => {
      const input = { email: 'user@example.com', password: 'weakpass1' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a weak password (no number)', () => {
      const input = { email: 'user@example.com', password: 'WeakPassNo' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a short password', () => {
      const input = { email: 'user@example.com', password: 'Sh1' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid email', () => {
      const input = { email: 'not-an-email', password: 'StrongPass1' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('accepts registration without optional name', () => {
      const input = { email: 'user@example.com', password: 'StrongPass1' };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const input = { email: 'a@b.com', password: 'x' };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects missing email', () => {
      const input = { password: 'x' };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const input = { email: 'bad', password: 'x' };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('dateRangeSchema', () => {
    it('accepts valid date range', () => {
      const input = { start: '2024-01-01', end: '2024-12-31' };
      const result = dateRangeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid date format', () => {
      const input = { start: '01/01/2024', end: '2024-12-31' };
      const result = dateRangeSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('chatMessageSchema', () => {
    it('accepts a valid chat message', () => {
      const input = { message: 'Hello' };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('accepts a message with history', () => {
      const input = { message: 'Tell me more', history: [{ role: 'user', content: 'Hi' }] };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects an empty message', () => {
      const input = { message: '' };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects a message exceeding 2000 characters', () => {
      const input = { message: 'x'.repeat(2001) };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects history exceeding 100 entries', () => {
      const input = {
        message: 'test',
        history: Array(101).fill({ role: 'user', content: 'msg' }),
      };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('rejects invalid role in history', () => {
      const input = {
        message: 'test',
        history: [{ role: 'admin', content: 'msg' }],
      };
      const result = chatMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
