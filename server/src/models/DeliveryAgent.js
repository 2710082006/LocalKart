const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ['bicycle', 'motorcycle', 'auto', 'van'],
    default: 'motorcycle'
  },
  vehicleNumber: String,
  licenseNumber: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  assignedOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  completedDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  zone: String,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  }
}, {
  timestamps: true
});

deliveryAgentSchema.index({ userId: 1 });
deliveryAgentSchema.index({ isAvailable: 1 });
deliveryAgentSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
