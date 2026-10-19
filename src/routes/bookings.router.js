import { Router } from 'express';
import { createBooking, getBookingById, addServiceToBooking } from '../controllers/bookings.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  bookingParamsSchema,
  bookingServiceParamsSchema,
} from '../schemas/bookings.schema.js';

const router = Router();

router.post('/', validate({ body: createBookingSchema }), createBooking);
router.get('/:bid', validate({ params: bookingParamsSchema }), getBookingById);
router.post('/:bid/services/:sid', validate({ params: bookingServiceParamsSchema }), addServiceToBooking);

export default router;
