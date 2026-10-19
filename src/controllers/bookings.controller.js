import bookingsService from '../services/bookings.service.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingsService.createBooking(req.body);
    return res.status(201).json({ status: 'success', payload: booking });
  } catch (error) {
    return next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.bid);
    return res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    return next(error);
  }
};

export const addServiceToBooking = async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const booking = await bookingsService.addServiceToBooking(bid, sid);
    return res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    return next(error);
  }
};
