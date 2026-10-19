import servicesService from '../services/services.service.js';
import { emitEvent } from '../sockets/socket.js';

const notifyChange = async (event, payload) => {
  try {
    emitEvent(event, payload);
    emitEvent('availability:updated', await servicesService.getAvailability());
  } catch (error) {
    console.error(`No se pudo notificar el evento ${event}: ${error.message}`);
  }
};

const buildPageLink = (req, query, page) => {
  if (page === null) return null;

  const params = new URLSearchParams();
  if (query.category !== undefined) params.set('category', query.category);
  if (query.available !== undefined) params.set('available', String(query.available));
  if (query.sortBy !== undefined) params.set('sortBy', query.sortBy);
  params.set('order', query.order);
  params.set('limit', String(query.limit));
  params.set('page', String(page));

  return `${req.baseUrl}?${params.toString()}`;
};

export const getServices = async (req, res, next) => {
  try {
    const query = req.validatedQuery;
    const { docs, ...pagination } = await servicesService.getServices(query);

    return res.status(200).json({
      status: 'success',
      payload: docs,
      ...pagination,
      prevLink: buildPageLink(req, query, pagination.prevPage),
      nextLink: buildPageLink(req, query, pagination.nextPage),
    });
  } catch (error) {
    return next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await servicesService.getServiceById(req.params.sid);
    return res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    return next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await servicesService.createService(req.body);
    await notifyChange('service:created', service);
    return res.status(201).json({ status: 'success', payload: service });
  } catch (error) {
    return next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await servicesService.updateService(req.params.sid, req.body);
    await notifyChange('service:updated', service);
    return res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    return next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await servicesService.deleteService(req.params.sid);
    await notifyChange('service:deleted', { id: service.id });
    return res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    return next(error);
  }
};
