import { Router, RequestHandler } from 'express';
import { Types } from 'mongoose';
import type { ApiResponse, PaginationQuery } from '@inithium/types';
import { BaseService, MongoId, MongoFilter, BulkUpdateItem } from '../service/base.service.js';

function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export type RouteExtender = (router: Router) => void;

export class BaseRouter<T> {
  readonly router: Router;

  constructor(
    private readonly service: BaseService<T>,
    extend?: RouteExtender
  ) {
    this.router = Router();
    this.registerBaseRoutes(extend);
  }

  private registerBaseRoutes(extend?: RouteExtender): void {
    const r = this.router;

    r.post('/bulk', this.handleCreateMany);
    r.post('/',     this.handleCreateOne);
    r.get('/',      this.handleReadMany);
    r.patch('/bulk',  this.handleUpdateMany);
    r.delete('/bulk', this.handleDeleteMany);

    if (extend) extend(r);

    r.get('/:id',    this.handleReadOne);
    r.patch('/:id',  this.handleUpdateOne);
    r.delete('/:id', this.handleDeleteOne);
  }

  private handleCreateOne: RequestHandler = async (req, res) => {
    try {
      const doc = await this.service.createOne(req.body as Partial<T>);
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(201).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to create document' };
      res.status(500).json(body);
    }
  };

  private handleCreateMany: RequestHandler = async (req, res) => {
    const { items } = req.body as { items: Partial<T>[] };
    if (!Array.isArray(items) || items.length === 0) {
      const body: ApiResponse = { success: false, error: '`items` must be a non-empty array' };
      return res.status(400).json(body);
    }
    try {
      const docs = await this.service.createMany(items);
      const body: ApiResponse<T[]> = { success: true, data: docs };
      res.status(201).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to create documents' };
      res.status(500).json(body);
    }
  };

  private handleReadOne: RequestHandler = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      return res.status(400).json(body);
    }
    try {
      const doc = await this.service.readOne({ _id: id });
      if (!doc) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        return res.status(404).json(body);
      }
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(200).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to read document' };
      res.status(500).json(body);
    }
  };

  private handleReadMany: RequestHandler = async (req, res) => {
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
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to read documents' };
      res.status(500).json(body);
    }
  };

  private handleUpdateOne: RequestHandler = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      return res.status(400).json(body);
    }
    try {
      const doc = await this.service.updateOne(id, req.body);
      if (!doc) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        return res.status(404).json(body);
      }
      const body: ApiResponse<T> = { success: true, data: doc };
      res.status(200).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to update document' };
      res.status(500).json(body);
    }
  };

  private handleUpdateMany: RequestHandler = async (req, res) => {
    const { items } = req.body as { items: BulkUpdateItem<T>[] };
    if (!Array.isArray(items) || items.length === 0) {
      const body: ApiResponse = { success: false, error: '`items` must be a non-empty array' };
      return res.status(400).json(body);
    }
    const invalidItem = items.find(({ id }) => !isValidObjectId(String(id)));
    if (invalidItem) {
      const body: ApiResponse = { success: false, error: `Invalid id in bulk update: ${invalidItem.id}` };
      return res.status(400).json(body);
    }
    try {
      const docs = await this.service.updateMany(items);
      const body: ApiResponse<T[]> = { success: true, data: docs };
      res.status(200).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to update documents' };
      res.status(500).json(body);
    }
  };

  private handleDeleteOne: RequestHandler = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      const body: ApiResponse = { success: false, error: `Invalid id: ${id}` };
      return res.status(400).json(body);
    }
    try {
      const deleted = await this.service.deleteOne(id);
      if (!deleted) {
        const body: ApiResponse = { success: false, error: 'Document not found' };
        return res.status(404).json(body);
      }
      const body: ApiResponse<{ id: string; deleted: boolean }> = { success: true, data: { id, deleted: true } };
      res.status(200).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to delete document' };
      res.status(500).json(body);
    }
  };

  private handleDeleteMany: RequestHandler = async (req, res) => {
    const { ids } = req.body as { ids: MongoId[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      const body: ApiResponse = { success: false, error: '`ids` must be a non-empty array' };
      return res.status(400).json(body);
    }
    const invalidId = ids.find((id) => !isValidObjectId(String(id)));
    if (invalidId) {
      const body: ApiResponse = { success: false, error: `Invalid id in bulk delete: ${invalidId}` };
      return res.status(400).json(body);
    }
    try {
      const deletedCount = await this.service.deleteMany(ids);
      const body: ApiResponse<{ deletedCount: number }> = { success: true, data: { deletedCount } };
      res.status(200).json(body);
    } catch (err: any) {
      const body: ApiResponse = { success: false, error: err?.message ?? 'Failed to delete documents' };
      res.status(500).json(body);
    }
  };
}

export function createCollectionRouter<T>(
  service: BaseService<T>,
  extend?: RouteExtender
): Router {
  return new BaseRouter<T>(service, extend).router;
}
