/**
 * Auth endpoints: validación de entrada (Zod). Sin captcha en login; no se requiere DB.
 */
jest.mock('otplib', () => ({ authenticator: {}, totp: {} }));
jest.mock('qrcode', () => ({ toDataURL: () => Promise.resolve('') }));
jest.mock('../../lib/audit', () => ({
  audit: jest.fn().mockResolvedValue(undefined),
  AuditActions: { LOGIN_FAILED: 'LOGIN_FAILED', LOGIN_SUCCESS: 'LOGIN_SUCCESS' },
}));

import request from 'supertest';
import app from '../../app';

async function getCsrf() {
  const agent = request.agent(app);
  const r = await agent.get('/api/v1/auth/csrf');
  return { agent, token: r.body.csrfToken as string };
}

describe('Auth validation (integration)', () => {
  describe('POST /api/v1/auth/login', () => {
    it('returns 401 when body is empty', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('returns 401 when email is missing', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({ password: 'ValidPass1!' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('returns 401 when email is invalid', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({ email: 'not-an-email', password: 'ValidPass1!' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('returns 401 when password is empty', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({ email: 'user@example.com', password: '' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('returns 400 when email is invalid', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/forgot-password')
        .set('X-Csrf-Token', token)
        .send({ email: 'bad-email' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
