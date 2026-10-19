import ServicesDAO from '../dao/services.dao.js';

export class ServicesRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll(filter) {
    return this.dao.getAll(filter);
  }

  paginate(filter, options) {
    return this.dao.paginate(filter, options);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    return this.dao.create(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  delete(id) {
    return this.dao.delete(id);
  }
}

export default new ServicesRepository(new ServicesDAO());
