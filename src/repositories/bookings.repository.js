import BookingsDAO from '../dao/bookings.dao.js';

export class BookingsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(data) {
    return this.dao.create(data);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByIdWithServices(id) {
    return this.dao.getByIdWithServices(id);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }
}

export default new BookingsRepository(new BookingsDAO());
