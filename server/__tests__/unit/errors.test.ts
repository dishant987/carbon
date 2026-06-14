import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ExternalServiceError,
} from '../../src/utils/errors';

describe('Custom Error Classes', () => {
  describe('AppError (base)', () => {
    it('creates an error with statusCode and message', () => {
      const err = new AppError(418, "I'm a teapot");
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(418);
      expect(err.message).toBe("I'm a teapot");
      expect(err.name).toBe('AppError');
    });
  });

  describe('ValidationError', () => {
    it('has status 400', () => {
      const err = new ValidationError('Invalid input');
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('has status 404 with default message', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Resource not found');
    });

    it('accepts a custom message', () => {
      const err = new NotFoundError('Activity not found');
      expect(err.message).toBe('Activity not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('has status 401', () => {
      const err = new UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('UnauthorizedError');
    });
  });

  describe('ForbiddenError', () => {
    it('has status 403', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.name).toBe('ForbiddenError');
    });
  });

  describe('ConflictError', () => {
    it('has status 409', () => {
      const err = new ConflictError('Email exists');
      expect(err.statusCode).toBe(409);
      expect(err.message).toBe('Email exists');
    });
  });

  describe('ExternalServiceError', () => {
    it('has status 502', () => {
      const err = new ExternalServiceError();
      expect(err.statusCode).toBe(502);
      expect(err.name).toBe('ExternalServiceError');
    });
  });

  describe('Error instanceof checks', () => {
    it('validates error hierarchy', () => {
      const err = new ValidationError('test');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(ValidationError);
      expect(err).not.toBeInstanceOf(NotFoundError);
    });
  });
});
