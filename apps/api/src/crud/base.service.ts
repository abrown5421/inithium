import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { NotFoundError } from '../errors/index.js';

/**
 * BaseService provides generic CRUD operations for any Mongoose model.
 *
 * T is intentionally unconstrained — we don't require T extends Document
 * because the existing models in this repo use a legacy `User & Document`
 * intersection type whose internal Document type parameters differ from the
 * modern HydratedDocument form. Constraining T causes irreconcilable generic
 * conflicts at the call-site. The Model<any> cast inside each method is safe
 * because Mongoose's runtime behaviour is identical regardless of the TS type.
 *
 * Collection-specific services extend this class and work with their own
 * concrete types, so type safety is preserved where it matters.
 */
export class BaseService<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly model: Model<any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(model: Model<any>) {
    this.model = model;
  }

  /** POST /api/:collection — create a new document */
  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    await doc.save();
    return doc.toObject() as T;
  }

  /** GET /api/:collection — return all documents */
  async findAll(): Promise<T[]> {
    return this.model.find({}).lean() as Promise<T[]>;
  }

  /** GET /api/:collection/:id — return one document by _id */
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

  /** PUT /api/:collection/:id — update and return the updated document */
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

  /** DELETE /api/:collection/:id — delete a document */
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
