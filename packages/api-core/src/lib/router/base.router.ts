import { Router, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { validate } from '@inithium/validators';
import type { ApiResponse, PaginationQuery } from '@inithium/types';
import { BaseService, MongoId, MongoFilter, BulkUpdateItem } from '../service/base.service.js';

const isValidObjectId = (id: string): boolean => Types.ObjectId.isValid(id);

export type RouteExtender = (router: Router) => void;

export class BaseRouter<T> {
  readonly router: Router;

  constructor(
    private readonly service: BaseService<T>,
    private readonly validators: {
      createOne:   Parameters<typeof validate>[0];
      createMany:  Parameters<typeof validate>[0];
      readOne:     Parameters<typeof validate>[0];
      readMany:    Parameters<typeof validate>[0];
      updateOne:   Parameters<typeof validate>[0];
      updateMany:  Parameters<typeof validate>[0];
      deleteOne:   Parameters<typeof validate>[0];
      deleteMany:  Parameters<typeof validate>[0];
    },
    extend?: RouteExtender
  ) {
    this.router = Router();
    this.registerBaseRoutes(extend);
  }

  private registerBaseRoutes(extend?: RouteExtender): void {
    const r = this.router;

    r.post('/bulk', validate(this.validators.createMany),  this.handleCreateMany);
    r.post('/',     validate(this.validators.createOne),   this.handleCreateOne);
    r.get('/',      validate(this.validators.readMany),    this.handleReadMany);
    r.patch('/bulk',  validate(this.validators.updateMany), this.handleUpdateMany);
    r.delete('/bulk', validate(this.validators.deleteMany), this.handleDeleteMany);

    if (extend) extend(r);

    r.get('/:id',    validate(this.validators.readOne),   this.handleReadOne);
    r.patch('/:id',  validate(this.validators.updateOne), this.handleUpdateOne);
    r.delete('/:id', validate(this.validators.deleteOne), this.handleDeleteOne);
  }

  private handleCreateOne: RequestHandler = async (req, res, next) => {
    try {
      const doc = await this.service.createOne(req.body as Partial<T>);
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleCreateMany: RequestHandler = async (req, res, next) => {
    try {
      const { items } = req.body as { items: Partial<T>[] };
      const docs = await this.service.createMany(items);
      const body: ApiResponse<T[]> = { success: true, data: docs };
      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleReadOne: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      res.status(400).json(body);
      return;
    }
    try {
      const doc = await this.service.readOne({ _id: id });
      if (!doc) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        res.status(404).json(body);
        return;
      }
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleReadMany: RequestHandler = async (req, res, next) => {
    try {
      const { page, limit, sort, order, ...filterRaw } = req.query as Record<string, string>;

      const pagination: PaginationQuery = {
        page:  page  ? Number(page)  : undefined,
        limit: limit ? Number(limit) : undefined,
        sort,
        order: order === 'asc' ? 'asc' : 'desc',
      };

      const filter: MongoFilter = Object.keys(filterRaw).length > 0 ? filterRaw : {};

      const result = await this.service.readMany(filter, pagination);
      const body: ApiResponse<typeof result> = { success: true, data: result };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleUpdateOne: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      res.status(400).json(body);
      return;
    }
    try {
      const doc = await this.service.updateOne(id, req.body);
      if (!doc) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        res.status(404).json(body);
        return;
      }
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleUpdateMany: RequestHandler = async (req, res, next) => {
    try {
      const { items } = req.body as { items: BulkUpdateItem<T>[] };
      const docs = await this.service.updateMany(items);
      const body: ApiResponse<T[]> = { success: true, data: docs };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleDeleteOne: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      res.status(400).json(body);
      return;
    }
    try {
      const deleted = await this.service.deleteOne(id);
      if (!deleted) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        res.status(404).json(body);
        return;
      }
      const body: ApiResponse<{ id: string; deleted: boolean }> = {
        success: true,
        data: { id, deleted: true },
      };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };

  private handleDeleteMany: RequestHandler = async (req, res, next) => {
    try {
      const { ids } = req.body as { ids: MongoId[] };
      const deletedCount = await this.service.deleteMany(ids);
      const body: ApiResponse<{ deletedCount: number }> = {
        success: true,
        data: { deletedCount },
      };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };
}

export const createCollectionRouter = <T>(
  service: BaseService<T>,
  validators: ConstructorParameters<typeof BaseRouter<T>>[1],
  extend?: RouteExtender
): Router => new BaseRouter<T>(service, validators, extend).router;
