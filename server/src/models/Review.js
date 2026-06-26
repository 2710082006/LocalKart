const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: 1000
  },
  images: [{
    public_id: String,
    url: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  response: {
    text: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ userId: 1, farmerId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ farmerId: 1 });

// Static method to calculate average rating for product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const Product = require('./Product');
  const result = await this.aggregate([
    { $match: { productId } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': Math.round(result[0].avgRating * 10) / 10,
      'rating.count': result[0].count
    });
  } else {
    // No reviews left — reset to 0
    await Product.findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

// Static method to calculate average rating for farmer
reviewSchema.statics.calcFarmerRating = async function(farmerId) {
  const Farmer = require('./Farmer');
  const result = await this.aggregate([
    { $match: { farmerId } },
    { $group: { _id: '$farmerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    await Farmer.findByIdAndUpdate(farmerId, {
      'rating.average': Math.round(result[0].avgRating * 10) / 10,
      'rating.count': result[0].count
    });
  } else {
    // No reviews left — reset to 0
    await Farmer.findByIdAndUpdate(farmerId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

reviewSchema.post('save', async function() {
  if (this.productId) await this.constructor.calcAverageRating(this.productId);
  if (this.farmerId) await this.constructor.calcFarmerRating(this.farmerId);
});

module.exports = mongoose.model('Review', reviewSchema);
