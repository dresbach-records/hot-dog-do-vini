import { Router } from 'express';
import { rhController } from './rh.controller.js';

const router = Router();

router.get('/', rhController.list);
router.post('/', rhController.create);
router.put('/:id', rhController.update);
router.delete('/:id', rhController.delete);

export default router;
