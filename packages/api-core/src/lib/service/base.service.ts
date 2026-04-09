import { Model, UpdateQuery, Types } from 'mongoose';
import type {
  PaginatedResult,
  PaginationQuery,
} from '@inithium/types';

export type MongoId = string | Types.ObjectId;

export type MongoFilter = Record<string, unknown>;

export interface BulkUpdateItem<T> {
  id: MongoId;
  update: UpdateQuery<T>;
}

export interface UpdateManyBody<T> {
  items: BulkUpdateItem<T>[];
}

export class BaseService<T> {
  constructor(protected readonly model: Model<T>) {}

  async createOne(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return (await doc.save()).toObject() as T;
  }

  async createMany(items: Partial<T>[]): Promise<T[]> {
    const docs = await this.model.insertMany(items);
    return docs.map((d) => (d as any).toObject() as T);
  }

  async readOne(filter: MongoFilter): Promise<T | null> {
    return this.model.findOne(filter as any).lean<T>().exec();
  }

  async readMany(
    filter: MongoFilter,
    pagination: PaginationQuery = {}
  ): Promise<PaginatedResult<T>> {
    const page  = Math.max(1, pagination.page  ?? 1);
    const limit = Math.min(100, Math.max(1, pagination.limit ?? 20));
    const skip  = (page - 1) * limit;

    const sortField = pagination.sort  ?? 'createdAt';
    const sortOrder = pagination.order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.model
        .find(filter as any)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<T[]>()
        .exec(),
      this.model.countDocuments(filter as any).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOne(
    id: MongoId,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean<T>()
      .exec();
  }

  async updateMany(items: BulkUpdateItem<T>[]): Promise<T[]> {
    const results = await Promise.all(
      items.map(({ id, update }) =>
        this.model
          .findByIdAndUpdate(id, update, { new: true, runValidators: true })
          .lean<T>()
          .exec()
      )
    );
    return results.filter((r) => r !== null) as T[];
  }

  async deleteOne(id: MongoId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteMany(ids: MongoId[]): Promise<number> {
    const result = await this.model
      .deleteMany({ _id: { $in: ids } } as any)
      .exec();
    return result.deletedCount ?? 0;
  }
}
