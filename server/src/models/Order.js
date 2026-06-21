const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: String
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'placed'
  },
  deliveryAddress: {
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },
    phone: String
  },
  deliverySlot: {
    date: Date,
    timeSlot: String // e.g., "10:00 AM - 12:00 PM"
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  deliveryAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAgent'
  },
  timeline: [timelineEventSchema],
  notes: String,
  cancellationReason: String,
  invoice: {
    number: String,
    url: String
  },
  estimatedDelivery: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ deliveryAgentId: 1 });

// Generate order number before save
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `F2D-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
