const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    court: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ court: 1, startTime: 1 }, { unique: true });

reservationSchema.pre('validate', function setDuration(next) {
  if (!this.startTime) {
    return next();
  }

  const durationMs = 60 * 60 * 1000;
  const start = new Date(this.startTime);

  if (Number.isNaN(start.getTime())) {
    return next(new Error('La fecha de inicio no es válida'));
  }

  this.endTime = new Date(start.getTime() + durationMs);
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
