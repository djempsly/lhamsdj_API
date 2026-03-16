/**
 * Health check test. We mock ESM-heavy deps (otplib/qrcode) so the app loads under Jest.
 */
jest.mock('otplib', () => ({ authenticator: {}, totp: {} }));
jest.mock('qrcode', () => ({ toDataURL: () => Promise.resolve('') }));

import request from 'supertest';
import app from '../../app';

describe('API health', () => {
  it('GET / returns 200 and status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'LhamsDJ API');
  }, 30000);
});
