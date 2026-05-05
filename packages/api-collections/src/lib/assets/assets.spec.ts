import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import { AssetModel } from './assets.model.js';
import { assetsService } from './assets.service.js';
import { assetsRouter } from './assets.router.js';

const app = express();
app.use(express.json());
app.use('/assets', assetsRouter);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await AssetModel.deleteMany({});
});

describe('Asset Module', () => {
  const mockAsset = {
    filename: 'hero-banner.png',
    original_name: 'Hero Banner.png',
    mimetype: 'image/png',
    size: 204800,
    storage_key: 'uploads/2024/hero-banner.png',
    category: 'image' as const,
    is_system_asset: false,
  };

  describe('AssetModel & Schema', () => {
    it('should create an asset with all required fields', async () => {
      const asset = await AssetModel.create(mockAsset);
      expect(asset.filename).toBe(mockAsset.filename);
      expect(asset.original_name).toBe(mockAsset.original_name);
      expect(asset.mimetype).toBe(mockAsset.mimetype);
      expect(asset.size).toBe(mockAsset.size);
      expect(asset.storage_key).toBe(mockAsset.storage_key);
      expect(asset.category).toBe(mockAsset.category);
      expect(asset.is_system_asset).toBe(false);
    });

    it('should default is_system_asset to false when not provided', async () => {
      const { is_system_asset, ...withoutFlag } = mockAsset;
      const asset = await AssetModel.create(withoutFlag);
      expect(asset.is_system_asset).toBe(false);
    });

    it('should fail if required fields are missing', async () => {
      const invalid = new AssetModel({ filename: 'test.png' });
      await expect(invalid.save()).rejects.toThrow();
    });

    it('should enforce unique storage_key', async () => {
      await AssetModel.create(mockAsset);
      await expect(AssetModel.create({ ...mockAsset })).rejects.toThrow();
    });

    it('should reject an invalid category value', async () => {
      const invalid = new AssetModel({ ...mockAsset, category: 'video' });
      await expect(invalid.save()).rejects.toThrow();
    });

    it('should accept every valid category value', async () => {
      const categories: Array<'image' | 'font' | 'audio' | 'document' | 'other'> = [
        'image', 'font', 'audio', 'document', 'other',
      ];
      for (const [i, category] of categories.entries()) {
        const asset = await AssetModel.create({
          ...mockAsset,
          storage_key: `uploads/file-${i}`,
          category,
        });
        expect(asset.category).toBe(category);
      }
    });

    it('should add createdAt and updatedAt timestamps', async () => {
      const asset = await AssetModel.create(mockAsset);
      expect(asset.createdAt).toBeDefined();
      expect(asset.updatedAt).toBeDefined();
    });
  });

  describe('AssetService', () => {
    describe('findByStorageKey()', () => {
      it('should return an asset matching the storage key', async () => {
        await AssetModel.create(mockAsset);
        const found = await assetsService.findByStorageKey(mockAsset.storage_key);
        expect(found).not.toBeNull();
        expect(found?.storage_key).toBe(mockAsset.storage_key);
      });

      it('should return null when no asset matches the storage key', async () => {
        const found = await assetsService.findByStorageKey('uploads/nonexistent.png');
        expect(found).toBeNull();
      });
    });

    describe('findByCategory()', () => {
      it('should return assets filtered by category', async () => {
        await AssetModel.create(mockAsset);
        await AssetModel.create({
          ...mockAsset,
          storage_key: 'uploads/font.woff2',
          category: 'font',
          filename: 'custom-font.woff2',
          original_name: 'Custom Font.woff2',
          mimetype: 'font/woff2',
        });

        const images = await assetsService.findByCategory('image');
        expect(images).toHaveLength(1);
        expect(images[0].category).toBe('image');
      });

      it('should return an empty array when no assets match the category', async () => {
        const result = await assetsService.findByCategory('audio');
        expect(result).toEqual([]);
      });

      it('should return all assets sharing the same category', async () => {
        await AssetModel.create(mockAsset);
        await AssetModel.create({
          ...mockAsset,
          storage_key: 'uploads/banner-2.jpg',
          filename: 'banner-2.jpg',
          original_name: 'Banner 2.jpg',
        });

        const images = await assetsService.findByCategory('image');
        expect(images).toHaveLength(2);
        images.forEach((a) => expect(a.category).toBe('image'));
      });
    });
  });

  describe('AssetsRouter (Integration)', () => {
    describe('GET /assets', () => {
        it('should return a paginated list of assets', async () => {
            await AssetModel.create(mockAsset);
            const response = await request(app).get('/assets');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.items)).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.total).toBe(1);
        });

        it('should return an empty list when no assets exist', async () => {
            const response = await request(app).get('/assets');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(0);
            expect(response.body.data.total).toBe(0);
        });
    });

    describe('POST /assets', () => {
      it('should create and return a new asset', async () => {
        const response = await request(app).post('/assets').send(mockAsset);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.storage_key).toBe(mockAsset.storage_key);
        expect(response.body.data.category).toBe(mockAsset.category);
      });

      it('should return 422 when required fields are missing', async () => {
        const response = await request(app)
          .post('/assets')
          .send({ filename: 'incomplete.png' });

        expect(response.status).toBe(422);
        expect(response.body.error).toBeDefined();
      });

      it('should return 422 for an invalid category', async () => {
        const response = await request(app)
          .post('/assets')
          .send({ ...mockAsset, category: 'video' });

        expect(response.status).toBe(422);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /assets/:id', () => {
      it('should return a single asset by id', async () => {
        const created = await AssetModel.create(mockAsset);

        const response = await request(app).get(`/assets/${created._id}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.storage_key).toBe(mockAsset.storage_key);
      });

      it('should return 404 for a non-existent id', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/assets/${fakeId}`);

        expect(response.status).toBe(404);
      });
    });

    describe('PATCH /assets/:id', () => {
      it('should update and return the modified asset', async () => {
        const created = await AssetModel.create(mockAsset);

        const response = await request(app)
          .patch(`/assets/${created._id}`)
          .send({ size: 999999 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.size).toBe(999999);
      });

      it('should return 404 when updating a non-existent asset', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .patch(`/assets/${fakeId}`)
          .send({ size: 1 });

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /assets/:id', () => {
      it('should delete an asset and return 200', async () => {
        const created = await AssetModel.create(mockAsset);

        const response = await request(app).delete(`/assets/${created._id}`);

        expect(response.status).toBe(200);
        const gone = await AssetModel.findById(created._id);
        expect(gone).toBeNull();
      });

      it('should return 404 when deleting a non-existent asset', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/assets/${fakeId}`);

        expect(response.status).toBe(404);
      });
    });
  });
});