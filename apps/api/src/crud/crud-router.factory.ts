import { Router } from 'express';
import type { BaseController } from './base.controller.js';

/**
 * createCrudRouter wires the five standard REST operations onto a new
 * Express Router instance.
 *
 * The controller parameter accepts BaseController<any> so that concrete
 * subclasses with different (non-Document) type parameters can be passed in
 * without TypeScript trying to unify their internal Mongoose generic shapes.
 *
 * Usage:
 *   const router = createCrudRouter(userController);
 *   router.get('/search', userController.search);   // collection-specific extra
 *   export { router as userRouter };
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCrudRouter(controller: BaseController<any>): Router {
  const router = Router();

  router.post('/',      controller.create);    // POST   /
  router.get('/',       controller.findAll);   // GET    /
  router.get('/:id',    controller.findById);  // GET    /:id
  router.put('/:id',    controller.update);    // PUT    /:id
  router.delete('/:id', controller.remove);   // DELETE /:id

  return router;
}
