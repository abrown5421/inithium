import { createCrudRouter } from '../../crud/index.js';
import { userController } from './user.controller.js';

const router = createCrudRouter(userController);

router.get('/search', userController.search);

export { router as userRouter };
