import servicesRepository from '../repositories/services.repository.js';
import { NotFoundError } from '../utils/errors.js';

export class ServicesService {
  constructor(repository) {
    this.repository = repository;
  }

  async getServices(options = {}) {
    const { category, available, page = 1, limit = 10, sortBy, order = 'asc' } = options;
    const filter = {};

    if (category !== undefined) filter.category = category.toLowerCase();
    if (available !== undefined) filter.available = available;

    const sort = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};

    return this.repository.paginate(filter, { page, limit, sort });
  }

  async getAllServices() {
    return this.repository.getAll();
  }

  async getAvailability() {
    const services = await this.repository.getAll();
    const available = services.filter((service) => service.available);
    const unavailable = services.filter((service) => !service.available);
    const groups = new Map();

    for (const service of available) {
      if (!groups.has(service.category)) groups.set(service.category, []);
      groups.get(service.category).push(service);
    }

    const categories = [...groups.entries()]
      .map(([category, items]) => ({
        category,
        services: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));

    return {
      totalServices: services.length,
      totalAvailable: available.length,
      categories,
      unavailable: unavailable.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  async getServiceById(id) {
    const service = await this.repository.getById(id);
    if (!service) throw new NotFoundError(`No existe un servicio con id ${id}`);
    return service;
  }

  async createService(data) {
    return this.repository.create(data);
  }

  async updateService(id, changes) {
    const updated = await this.repository.update(id, changes);
    if (!updated) throw new NotFoundError(`No existe un servicio con id ${id}`);
    return updated;
  }

  async deleteService(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError(`No existe un servicio con id ${id}`);
    return deleted;
  }
}

export default new ServicesService(servicesRepository);
