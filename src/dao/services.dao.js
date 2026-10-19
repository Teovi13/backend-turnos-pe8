import ServiceModel from '../models/service.model.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const isValidId = (id) => typeof id === 'string' && OBJECT_ID_REGEX.test(id);

export const toService = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

export default class ServicesDAO {
  async getAll(filter = {}) {
    const services = await ServiceModel.find(filter).sort({ _id: 1 }).lean();
    return services.map(toService);
  }

  async paginate(filter = {}, { page = 1, limit = 10, sort = {} } = {}) {
    const [docs, totalDocs] = await Promise.all([
      ServiceModel.find(filter)
        .sort({ ...sort, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServiceModel.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      docs: docs.map(toService),
      totalDocs,
      limit,
      page,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }

  async getById(id) {
    if (!isValidId(id)) return null;
    return toService(await ServiceModel.findById(id).lean());
  }

  async create(data) {
    const created = await ServiceModel.create(data);
    return toService(created.toObject());
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    const updated = await ServiceModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
    return toService(updated);
  }

  async delete(id) {
    if (!isValidId(id)) return null;
    return toService(await ServiceModel.findByIdAndDelete(id).lean());
  }
}
