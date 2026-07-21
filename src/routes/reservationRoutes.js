const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createReservation,
  cancelReservation,
  getMyReservations,
} = require('../controllers/reservationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMyReservations);
router.post('/', createReservation);
router.patch('/:id/cancel', cancelReservation);

module.exports = router;
