import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../../src/middleware/sanitize';

describe('Sanitize Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, query: {}, params: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('strips $ characters from string values in body', () => {
    mockReq.body = { name: 'test$where', amount: '$gt' };
    sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq.body as Record<string, string>).name).toBe('testwhere');
    expect((mockReq.body as Record<string, string>).amount).toBe('gt');
  });

  it('preserves non-string values unchanged', () => {
    mockReq.body = { amount: 100, active: true, tags: ['a', 'b'] };
    sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq.body as Record<string, unknown>).amount).toBe(100);
    expect((mockReq.body as Record<string, unknown>).active).toBe(true);
    expect((mockReq.body as Record<string, unknown>).tags).toEqual(['a', 'b']);
  });

  it('sanitizes nested objects recursively', () => {
    mockReq.body = { user: { name: '$where', nested: { query: '$ne' } } };
    sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

    const body = mockReq.body as Record<string, Record<string, unknown>>;
    expect(body.user.name).toBe('where');
    expect((body.user.nested as Record<string, string>).query).toBe('ne');
  });

  it('sanitizes query and params as well', () => {
    mockReq.query = { search: '$where' } as Request['query'];
    mockReq.params = { id: 'abc$def' };

    sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq.query as Record<string, string>).search).toBe('where');
    expect((mockReq.params as Record<string, string>).id).toBe('abcdef');
  });

  it('calls next after sanitization', () => {
    sanitizeInput(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
