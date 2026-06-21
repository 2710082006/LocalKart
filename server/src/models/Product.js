const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: [
      'vegetables', 'fruits', 'grains', 'pulses', 'dairy',
      'spices', 'herbs', 'nuts', 'honey', 'oils',
      'flowers', 'organic', 'millets', 'seeds', 'other'
    ]
  },
  subCategory: String,
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: Number,
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', '500g', 'dozen', 'piece', 'litre', 'ml', 'bundle', 'packet'],
    default: 'kg'
  },
  images: [{
    public_id: String,
    url: String
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  nutritionInfo: {
    calories: String,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String
  },
  shelfLife: String,
  harvestDate: Date,
  totalSold: {
    type: Number,
    default: 0
  },
  deliveryEstimate: {
    type: String,
    default: '1-2 hours'
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ farmerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ isAvailable: 1, stock: 1 });

// Auto set isAvailable based on stock
productSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    this.isAvailable = this.stock > 0;
  }
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
