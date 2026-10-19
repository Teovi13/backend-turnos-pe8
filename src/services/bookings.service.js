import bookingsRepository from '../repositories/bookings.repository.js';
import servicesRepository from '../repositories/services.repository.js';
import { NotFoundError, BusinessRuleError } from '../utils/errors.js';

export class BookingsService {
  constructor(bookingsRepo, servicesRepo) {
    this.bookingsRepository = bookingsRepo;
    this.servicesRepository = servicesRepo;
  }

  async createBooking(data) {
    return this.bookingsRepository.create({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      date: data.date,
      time: data.time,
      status: data.status ?? 'pending',
      services: [],
    });
  }

  async getBookingById(id) {
    const booking = await this.bookingsRepository.getByIdWithServices(id);
    if (!booking) throw new NotFoundError(`No existe una reserva con id ${id}`);

    const total = booking.services.reduce(
      (sum, item) => (item.service ? sum + item.service.price * item.quantity : sum),
      0
    );

    return { ...booking, total };
  }

  async addServiceToBooking(bookingId, serviceId) {
    const booking = await this.bookingsRepository.getById(bookingId);
    if (!booking) throw new NotFoundError(`No existe una reserva con id ${bookingId}`);

    const service = await this.servicesRepository.getById(serviceId);
    if (!service) throw new NotFoundError(`No existe un servicio con id ${serviceId}`);
    if (!service.available) {
      throw new BusinessRuleError(`El servicio ${serviceId} no está disponible para reservar`);
    }

    const exists = booking.services.some((item) => item.service === service.id);

    const services = exists
      ? booking.services.map((item) =>
          item.service === service.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...booking.services, { service: service.id, quantity: 1 }];

    return this.bookingsRepository.update(bookingId, { services });
  }
}

export default new BookingsService(bookingsRepository, servicesRepository);
