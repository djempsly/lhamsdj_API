/**
 * Protected routes return 401 without auth. No DB needed (auth middleware runs first).
 */
jest.mock('otplib', () => ({ authenticator: {}, totp: {} }));
jest.mock('qrcode', () => ({ toDataURL: () => Promise.resolve('') }));

import request from 'supertest';
import app from '../../app';

async function getCsrf() {
  const agent = request.agent(app);
  const r = await agent.get('/api/v1/auth/csrf');
  return { agent, token: r.body.csrfToken as string };
}

describe('Protected API (no auth)', () => {
  it('GET /api/v1/cart returns 401 without credentials', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/orders returns 401 without credentials', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/wishlist returns 401 without credentials', async () => {
    const res = await request(app).get('/api/v1/wishlist');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/change-password returns 401 without credentials', async () => {
    const { agent, token } = await getCsrf();
    const res = await agent
      .post('/api/v1/auth/change-password')
      .set('X-Csrf-Token', token)
      .send({ currentPassword: 'OldPass1!', newPassword: 'NewPass1!' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
  });
});
