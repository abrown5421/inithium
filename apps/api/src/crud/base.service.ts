import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { NotFoundError } from '../errors/index.js';

export class BaseService<T> {
  protected readonly model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    await doc.save();
    return doc.toObject() as T;
  }

  async findAll(): Promise<T[]> {
    return this.model.find({}).lean() as Promise<T[]>;
  }

  async findById(id: string): Promise<T> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Document not found: invalid id "${id}"`);
    }
    const doc = await this.model.findById(id).lean();
    if (!doc) {
      throw new NotFoundError(`Document not found with id "${id}"`);
    }
    return doc as T;
  }

  async updateById(id: string, updates: Partial<T>): Promise<T> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Document not found: invalid id "${id}"`);
    }
    const doc = await this.model
      .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .lean();
    if (!doc) {
      throw new NotFoundError(`Document not found with id "${id}"`);
    }
    return doc as T;
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError(`Document not found: invalid id "${id}"`);
    }
    const result = await this.model.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Document not found with id "${id}"`);
    }
  }
}
