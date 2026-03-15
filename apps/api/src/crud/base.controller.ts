import type { Request, Response, NextFunction } from 'express';
import type { BaseService } from './base.service.js';

export class BaseController<T> {
  protected readonly service: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.service = service;
    this.create   = this.create.bind(this);
    this.findAll  = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.update   = this.update.bind(this);
    this.remove   = this.remove.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.service.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docs = await this.service.findAll();
      res.status(200).json(docs);
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.service.findById(req.params.id);
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.service.updateById(req.params.id, req.body);
      res.status(200).json(doc);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.deleteById(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
