import { createCrudRouter } from '../../crud/index.js';
import { userController } from './user.controller.js';

/**
 * userRouter wires all routes for /api/users.
 *
 * createCrudRouter registers these five base routes:
 *   POST   /          → create
 *   GET    /          → findAll
 *   GET    /:id       → findById
 *   PUT    /:id       → update
 *   DELETE /:id       → remove
 *
 * Static collection-specific paths (/search, /login) are added BEFORE the
 * /:id wildcard so Express resolves them correctly.
 *
 * ⚠️  ORDER MATTERS — always register named paths before /:id.
 *     createCrudRouter places /:id last, so appending named paths immediately
 *     after the factory call is safe and is the expected pattern for all
 *     collections.
 */
const router = createCrudRouter(userController);

// ─── Collection-specific routes ─────────────────────────────────────────────
router.get('/search', userController.search);   // GET  /api/users/search?q=
router.post('/login', userController.login);    // POST /api/users/login

export { router as userRouter };
