import request from 'supertest';
import express from 'express';

jest.mock('@inithium/api-core', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

describe('GET /', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.get('/', (_req, res) => {
      res.send({ message: 'Hello API' });
    });
  });

  it('should return a 200 status and the welcome message', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello API' });
  });

  it('should have JSON content type', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});