import { Model, Types } from 'mongoose';
import { BaseService } from './base.service.js';

// ── Minimal Mongoose Model mock ───────────────────────────────────────────────

function makeMockModel() {
  const lean    = jest.fn().mockReturnThis();
  const exec    = jest.fn();
  const sort    = jest.fn().mockReturnThis();
  const skip    = jest.fn().mockReturnThis();
  const limit   = jest.fn().mockReturnThis();
  const select  = jest.fn().mockReturnThis();

  const mockDocSave = jest.fn();
  const mockDoc = {
    save:     mockDocSave,
    toObject: jest.fn(() => ({ _id: 'abc', name: 'Test' })),
  };

  const model: any = jest.fn(() => mockDoc);

  model.insertMany        = jest.fn();
  model.findOne           = jest.fn().mockReturnValue({ lean, exec });
  model.find              = jest.fn().mockReturnValue({ sort, skip, limit, lean, exec });
  model.countDocuments    = jest.fn().mockReturnValue({ exec });
  model.findByIdAndUpdate = jest.fn().mockReturnValue({ lean, exec });
  model.findByIdAndDelete = jest.fn().mockReturnValue({ exec });
  model.deleteMany        = jest.fn().mockReturnValue({ exec });

  return { model, lean, exec, sort, skip, limit, mockDoc, mockDocSave };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BaseService', () => {
  let mocks: ReturnType<typeof makeMockModel>;
  let service: BaseService<any>;

  beforeEach(() => {
    mocks   = makeMockModel();
    service = new BaseService(mocks.model as unknown as Model<any>);
    jest.clearAllMocks();
  });

  // ── createOne ───────────────────────────────────────────────────────────────

  describe('createOne', () => {
    it('saves a new document and returns its plain object', async () => {
      const payload = { name: 'Alice' };
      mocks.mockDocSave.mockResolvedValueOnce(mocks.mockDoc);

      const result = await service.createOne(payload);

      expect(mocks.model).toHaveBeenCalledWith(payload);
      expect(mocks.mockDocSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'abc', name: 'Test' });
    });
  });

  // ── createMany ──────────────────────────────────────────────────────────────

  describe('createMany', () => {
    it('inserts multiple documents and returns plain objects', async () => {
      const items = [{ name: 'A' }, { name: 'B' }];
      const fakeDocs = items.map((item) => ({
        ...item,
        toObject: jest.fn(() => item),
      }));
      mocks.model.insertMany.mockResolvedValueOnce(fakeDocs);

      const result = await service.createMany(items);

      expect(mocks.model.insertMany).toHaveBeenCalledWith(items);
      expect(result).toEqual(items);
    });
  });

  // ── readOne ─────────────────────────────────────────────────────────────────

  describe('readOne', () => {
    it('returns a document matching the filter', async () => {
      const doc = { _id: 'abc', name: 'Alice' };
      mocks.exec.mockResolvedValueOnce(doc);

      const result = await service.readOne({ _id: 'abc' });

      expect(mocks.model.findOne).toHaveBeenCalledWith({ _id: 'abc' });
      expect(result).toEqual(doc);
    });

    it('returns null when no document matches', async () => {
      mocks.exec.mockResolvedValueOnce(null);

      const result = await service.readOne({ _id: 'missing' });

      expect(result).toBeNull();
    });
  });

  // ── readMany ────────────────────────────────────────────────────────────────

  describe('readMany', () => {
    it('returns paginated results', async () => {
      const items = [{ _id: '1' }, { _id: '2' }];
      mocks.exec
        .mockResolvedValueOnce(items)  // find()
        .mockResolvedValueOnce(2);     // countDocuments()

      const result = await service.readMany({}, { page: 1, limit: 10 });

      expect(result.items).toEqual(items);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('applies default pagination when none is provided', async () => {
      mocks.exec.mockResolvedValueOnce([]).mockResolvedValueOnce(0);

      const result = await service.readMany({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('caps limit at 100', async () => {
      mocks.exec.mockResolvedValueOnce([]).mockResolvedValueOnce(0);

      const result = await service.readMany({}, { limit: 9999 });

      expect(result.limit).toBe(100);
    });
  });

  // ── updateOne ───────────────────────────────────────────────────────────────

  describe('updateOne', () => {
    it('updates and returns the updated document', async () => {
      const updated = { _id: 'abc', name: 'Updated' };
      mocks.exec.mockResolvedValueOnce(updated);

      const result = await service.updateOne('abc', { name: 'Updated' });

      expect(mocks.model.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { name: 'Updated' },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updated);
    });

    it('returns null when the document does not exist', async () => {
      mocks.exec.mockResolvedValueOnce(null);

      const result = await service.updateOne('nonexistent', {});

      expect(result).toBeNull();
    });
  });

  // ── updateMany ──────────────────────────────────────────────────────────────

  describe('updateMany', () => {
    it('updates each document and returns the successes', async () => {
      const updated = [{ _id: '1', name: 'A' }, { _id: '2', name: 'B' }];
      mocks.exec
        .mockResolvedValueOnce(updated[0])
        .mockResolvedValueOnce(updated[1]);

      const result = await service.updateMany([
        { id: '1', update: { name: 'A' } },
        { id: '2', update: { name: 'B' } },
      ]);

      expect(result).toEqual(updated);
    });

    it('filters out null results (not-found documents)', async () => {
      mocks.exec
        .mockResolvedValueOnce({ _id: '1' })
        .mockResolvedValueOnce(null);

      const result = await service.updateMany([
        { id: '1', update: {} },
        { id: 'missing', update: {} },
      ]);

      expect(result).toHaveLength(1);
    });
  });

  // ── deleteOne ───────────────────────────────────────────────────────────────

  describe('deleteOne', () => {
    it('returns true when the document is deleted', async () => {
      mocks.exec.mockResolvedValueOnce({ _id: 'abc' });

      const result = await service.deleteOne('abc');

      expect(mocks.model.findByIdAndDelete).toHaveBeenCalledWith('abc');
      expect(result).toBe(true);
    });

    it('returns false when the document does not exist', async () => {
      mocks.exec.mockResolvedValueOnce(null);

      const result = await service.deleteOne('nonexistent');

      expect(result).toBe(false);
    });
  });

  // ── deleteMany ──────────────────────────────────────────────────────────────

  describe('deleteMany', () => {
    it('deletes all matching documents and returns the count', async () => {
      mocks.exec.mockResolvedValueOnce({ deletedCount: 3 });

      const result = await service.deleteMany(['id1', 'id2', 'id3']);

      expect(mocks.model.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ['id1', 'id2', 'id3'] },
      });
      expect(result).toBe(3);
    });
  });
});
