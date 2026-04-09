import express from 'express';
import request from 'supertest';
import { Types } from 'mongoose';
import { createCollectionRouter } from './base.router.js';
import { BaseService } from '../service/base.service.js';

const validId   = new Types.ObjectId().toHexString();
const mockDoc   = { _id: validId, name: 'Test Doc' };
const mockPaged = { items: [mockDoc], total: 1, page: 1, limit: 20, totalPages: 1 };

const svc = {
  createOne:   jest.fn().mockResolvedValue(mockDoc),
  createMany:  jest.fn().mockResolvedValue([mockDoc]),
  readOne:     jest.fn().mockResolvedValue(mockDoc),
  readMany:    jest.fn().mockResolvedValue(mockPaged),
  updateOne:   jest.fn().mockResolvedValue(mockDoc),
  updateMany:  jest.fn().mockResolvedValue([mockDoc]),
  deleteOne:   jest.fn().mockResolvedValue(true),
  deleteMany:  jest.fn().mockResolvedValue(2),
} as unknown as BaseService<any>;

const app = express();
app.use(express.json());
app.use('/items', createCollectionRouter(svc));

beforeEach(() => jest.clearAllMocks());

describe('BaseRouter — 8 base routes', () => {
  describe('POST /items', () => {
    it('201 — creates a document', async () => {
      const res = await request(app).post('/items').send({ name: 'Test Doc' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true, data: mockDoc });
      expect(svc.createOne).toHaveBeenCalledWith({ name: 'Test Doc' });
    });
  });

  describe('POST /items/bulk', () => {
    it('201 — creates many documents', async () => {
      const res = await request(app)
        .post('/items/bulk')
        .send({ items: [{ name: 'A' }] });
      expect(res.status).toBe(201);
      expect(res.body.data).toEqual([mockDoc]);
    });

    it('400 — rejects empty items array', async () => {
      const res = await request(app).post('/items/bulk').send({ items: [] });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /items/:id', () => {
    it('200 — returns a document by id', async () => {
      const res = await request(app).get(`/items/${validId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDoc);
    });

    it('400 — rejects invalid ObjectId', async () => {
      const res = await request(app).get('/items/not-an-id');
      expect(res.status).toBe(400);
    });

    it('404 — returns 404 when document not found', async () => {
      (svc.readOne as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/items/${validId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /items', () => {
    it('200 — returns paginated results', async () => {
      const res = await request(app).get('/items?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockPaged);
      expect(svc.readMany).toHaveBeenCalled();
    });
  });

  describe('PATCH /items/:id', () => {
    it('200 — updates a document', async () => {
      const res = await request(app)
        .patch(`/items/${validId}`)
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockDoc);
    });

    it('400 — rejects invalid ObjectId', async () => {
      const res = await request(app).patch('/items/bad-id').send({});
      expect(res.status).toBe(400);
    });

    it('404 — returns 404 when document not found', async () => {
      (svc.updateOne as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).patch(`/items/${validId}`).send({});
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /items/bulk', () => {
    it('200 — updates many documents', async () => {
      const res = await request(app)
        .patch('/items/bulk')
        .send({ items: [{ id: validId, update: { name: 'X' } }] });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([mockDoc]);
    });

    it('400 — rejects empty items array', async () => {
      const res = await request(app).patch('/items/bulk').send({ items: [] });
      expect(res.status).toBe(400);
    });

    it('400 — rejects items containing an invalid ObjectId', async () => {
      const res = await request(app)
        .patch('/items/bulk')
        .send({ items: [{ id: 'bad', update: {} }] });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /items/:id', () => {
    it('200 — deletes a document', async () => {
      const res = await request(app).delete(`/items/${validId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: validId, deleted: true });
    });

    it('400 — rejects invalid ObjectId', async () => {
      const res = await request(app).delete('/items/bad-id');
      expect(res.status).toBe(400);
    });

    it('404 — returns 404 when document not found', async () => {
      (svc.deleteOne as jest.Mock).mockResolvedValueOnce(false);
      const res = await request(app).delete(`/items/${validId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /items/bulk', () => {
    it('200 — deletes many documents', async () => {
      const res = await request(app)
        .delete('/items/bulk')
        .send({ ids: [validId] });
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ deletedCount: 2 });
    });

    it('400 — rejects empty ids array', async () => {
      const res = await request(app).delete('/items/bulk').send({ ids: [] });
      expect(res.status).toBe(400);
    });

    it('400 — rejects ids containing an invalid ObjectId', async () => {
      const res = await request(app)
        .delete('/items/bulk')
        .send({ ids: ['not-valid'] });
      expect(res.status).toBe(400);
    });
  });
});

describe('BaseRouter — custom route extension', () => {
  const customApp = express();
  customApp.use(express.json());
  customApp.use(
    '/items',
    createCollectionRouter(svc, (router) => {
      router.get('/custom', (_req, res) => {
        res.json({ success: true, data: 'custom-route' });
      });
    })
  );

  it('200 — reaches the custom route alongside the base routes', async () => {
    const res = await request(customApp).get('/items/custom');
    expect(res.status).toBe(200);
    expect(res.body.data).toBe('custom-route');
  });

  it('base routes still work after extension', async () => {
    const res = await request(customApp).get('/items');
    expect(res.status).toBe(200);
  });
});
