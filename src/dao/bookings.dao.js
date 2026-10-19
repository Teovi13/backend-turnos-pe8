import BookingModel from '../models/booking.model.js';
import '../models/service.model.js';
import { toService } from './services.dao.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const isValidId = (id) => typeof id === 'string' && OBJECT_ID_REGEX.test(id);

const toBooking = (doc) => {
  if (!doc) return null;
  const { _id, services = [], ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    services: services.map(({ service, quantity }) => ({ service: service.toString(), quantity })),
  };
};

const toPopulatedBooking = (doc) => {
  if (!doc) return null;
  const { _id, services = [], ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    services: services.map(({ service, quantity }) => ({ service: toService(service), quantity })),
  };
};

export default class BookingsDAO {
  async create(data) {
    const created = await BookingModel.create(data);
    return toBooking(created.toObject());
  }

  async getById(id) {
    if (!isValidId(id)) return null;
    return toBooking(await BookingModel.findById(id).lean());
  }

  async getByIdWithServices(id) {
    if (!isValidId(id)) return null;
    const booking = await BookingModel.findById(id).populate('services.service').lean();
    return toPopulatedBooking(booking);
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    const updated = await BookingModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
    return toBooking(updated);
  }
}
