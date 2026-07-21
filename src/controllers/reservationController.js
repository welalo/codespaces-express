const Reservation = require('../models/Reservation');

const createReservation = async (req, res) => {
  try {
    const { court, startTime } = req.body;
    const userId = req.user._id;

    if (!court || !startTime) {
      return res.status(400).json({ message: 'court y startTime son obligatorios' });
    }

    if (court < 1 || court > 3) {
      return res.status(400).json({ message: 'La pista debe estar entre 1 y 3' });
    }

    const reservationDate = new Date(startTime);
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: 'La fecha de inicio no es válida' });
    }

    const existing = await Reservation.findOne({
      court,
      startTime: reservationDate,
      status: 'confirmed',
    });

    if (existing) {
      return res.status(409).json({ message: 'La pista ya está reservada en esa franja' });
    }

    const reservation = await Reservation.create({
      user: userId,
      court,
      startTime: reservationDate,
    });

    return res.status(201).json({ message: 'Reserva creada', reservation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findOne({ _id: id, user: req.user._id });

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'La reserva ya está cancelada' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    return res.json({ message: 'Reserva cancelada', reservation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({}).sort({ startTime: 1 });
    return res.json(reservations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createReservation, cancelReservation, getMyReservations };
