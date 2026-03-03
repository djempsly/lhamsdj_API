/**
 * Simulación de ataques: comprueba que las defensas responden correctamente
 * (SQL injection, JWT inválido, rate limit, payload excesivo).
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

describe('Security – simulación de ataques', () => {
  describe('SQL Injection', () => {
    it('rechaza body con patrón SQL (400)', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({
          email: "x'; DROP TABLE users;--",
          password: 'anything',
        })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/no permitida|Entrada/i);
    });

    it('rechaza body con UNION SELECT (400)', async () => {
      const { agent, token } = await getCsrf();
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({
          email: 'user@test.com',
          password: "x' UNION SELECT id,email FROM users --",
        })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('rechaza query con patrón SQL (400)', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ search: "'; DROP TABLE users;--" })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('JWT inválido / manipulado', () => {
    it('GET /api/v1/cart con Bearer inválido → 401', async () => {
      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('GET /api/v1/orders con JWT malformado (sin 3 partes) → 401', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer not-a-valid-jwt');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/me con token manipulado (payload base64 falso) → 401', async () => {
      const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJyb2xlIjoiADTpSUQiLCJlbWFpbCI6ImhhY2tAZXhhbXBsZS5jb20ifQ.fake';
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tampered}`);
      expect(res.status).toBe(401);
    });
  });

  describe('Rate limit (auth)', () => {
    it('más de 20 requests a /auth/login en la ventana → 429', async () => {
      const { agent, token } = await getCsrf();
      const loginBody = { email: 'test@example.com', password: 'ValidPass1!' };
      let lastStatus = 0;
      for (let i = 0; i < 22; i++) {
        const res = await agent
          .post('/api/v1/auth/login')
          .set('X-Csrf-Token', token)
          .send(loginBody)
          .set('Content-Type', 'application/json');
        lastStatus = res.status;
        if (res.status === 429) break;
      }
      expect(lastStatus).toBe(429);
    }, 30000);
  });

  describe('Payload excesivo (DoS)', () => {
    it('body JSON > 10kb → 413', async () => {
      const { agent, token } = await getCsrf();
      const big = 'x'.repeat(11 * 1024);
      const res = await agent
        .post('/api/v1/auth/login')
        .set('X-Csrf-Token', token)
        .send({ email: 'a@b.com', password: big })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(413);
    });
  });

  describe('CSRF', () => {
    it('POST sin X-Csrf-Token (y sin cookie) → 403', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'a@b.com', password: 'ValidPass1!' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/csrf|CSRF|inválido|invalid/i);
    });
  });

  describe('Path traversal', () => {
    it('ruta con .. no expone recurso interno → 404', async () => {
      const res = await request(app)
        .get('/api/v1/../auth/me')
        .set('Accept', 'application/json');
      expect([404, 401]).toContain(res.status);
    });
  });
});
