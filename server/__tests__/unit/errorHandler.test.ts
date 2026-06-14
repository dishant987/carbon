import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ExternalServiceError } from '../../src/utils/errors';

function createMockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('Error Handler Middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {} as Request;
    mockRes = createMockRes();
    mockNext = jest.fn();
  });

  it('returns 400 for ValidationError', () => {
    const err = new ValidationError('Invalid input');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid input',
    });
  });

  it('returns 404 for NotFoundError', () => {
    const err = new NotFoundError('Resource not found');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found',
    });
  });

  it('returns 401 for UnauthorizedError', () => {
    const err = new UnauthorizedError('Not authenticated');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Not authenticated',
    });
  });

  it('returns 403 for ForbiddenError', () => {
    const err = new ForbiddenError('Access denied');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Access denied',
    });
  });

  it('returns 409 for ConflictError', () => {
    const err = new ConflictError('Already exists');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Already exists',
    });
  });

  it('returns 502 for ExternalServiceError', () => {
    const err = new ExternalServiceError('Service unavailable');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Service unavailable',
    });
  });

  it('returns 500 for unhandled errors', () => {
    const err = new Error('Unexpected crash');
    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
  });
});
