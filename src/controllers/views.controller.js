import servicesService from '../services/services.service.js';

export const renderServices = async (req, res, next) => {
  try {
    const services = await servicesService.getAllServices();
    return res.render('services', {
      title: 'Servicios',
      isServices: true,
      services,
      hasServices: services.length > 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const renderAvailability = async (req, res, next) => {
  try {
    const availability = await servicesService.getAvailability();
    return res.render('availability', {
      title: 'Disponibilidad',
      isAvailability: true,
      ...availability,
      hasAvailable: availability.totalAvailable > 0,
      hasUnavailable: availability.unavailable.length > 0,
    });
  } catch (error) {
    return next(error);
  }
};
