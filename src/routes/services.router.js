import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceParamsSchema,
  servicesQuerySchema,
} from '../schemas/services.schema.js';

const router = Router();

router.get('/', validate({ query: servicesQuerySchema }), getServices);
router.get('/:sid', validate({ params: serviceParamsSchema }), getServiceById);
router.post('/', validate({ body: createServiceSchema }), createService);
router.put('/:sid', validate({ params: serviceParamsSchema, body: updateServiceSchema }), updateService);
router.delete('/:sid', validate({ params: serviceParamsSchema }), deleteService);

export default router;
