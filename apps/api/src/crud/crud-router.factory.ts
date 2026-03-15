import { Router } from 'express';
import type { BaseController } from './base.controller.js';

export function createCrudRouter(controller: BaseController<any>): Router {
  const router = Router();

  router.post('/',      controller.create);
  router.get('/',       controller.findAll);
  router.get('/:id',    controller.findById);
  router.put('/:id',    controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
