import { Request, Response } from 'express';
import { sanitizeInput } from '../../middleware/sanitizeMiddleware';

function mockRequest(body: unknown = undefined, query: unknown = undefined, params: unknown = undefined): Request {
  return {
    body,
    query: query || {},
    params: params || {},
  } as Request;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe('sanitizeInput middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
  });

  it('calls next when body is empty', () => {
    const req = mockRequest({});
    const res = mockResponse();
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sanitizes body by escaping HTML in strings', () => {
    const req = mockRequest({ name: '<script>alert(1)</script>', safe: 'hello' });
    const res = mockResponse();
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.name).not.toContain('<script>');
    expect(req.body.name).toContain('&lt;');
    expect(req.body.safe).toBe('hello');
  });

  it('returns 400 when body contains SQL injection pattern', () => {
    const req = mockRequest({ q: "'; DROP TABLE users;--" });
    const res = mockResponse();
    sanitizeInput(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Entrada no permitida.' })
    );
  });
});
