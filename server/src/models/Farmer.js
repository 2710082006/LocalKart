const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    farmName: {
      type: String,
      required: [true, "Please provide a farm name"],
      trim: true,
      maxlength: [100, "Farm name cannot exceed 100 characters"]
    },

    slug: {
      type: String,
      unique: true
    },

    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },

    specialties: [
      {
        type: String,
        trim: true
      }
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere"
      },
      address: {
        type: String,
        default: ""
      },
      city: {
        type: String,
        default: ""
      },
      state: {
        type: String,
        default: ""
      },
      pincode: {
        type: String,
        default: ""
      }
    },

    coverImage: {
      public_id: String,
      url: {
        type: String,
        default: ""
      }
    },

    images: [
      {
        public_id: String,
        url: String
      }
    ],

    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        document: {
          public_id: String,
          url: String
        }
      }
    ],

    // PAYMENT DETAILS
    paymentDetails: {
      upiId: {
        type: String,
        default: ""
      },
      bankName: {
        type: String,
        default: ""
      },
      accountHolder: {
        type: String,
        default: ""
      },
      accountNumber: {
        type: String,
        default: ""
      },
      ifscCode: {
        type: String,
        default: ""
      }
    },

    operatingHours: {
      open: {
        type: String,
        default: "06:00"
      },
      close: {
        type: String,
        default: "20:00"
      }
    },

    deliveryRadius: {
      type: Number,
      default: 10,
      max: 50
    },

    minimumOrder: {
      type: Number,
      default: 0
    },

    isApproved: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },

    totalProducts: {
      type: Number,
      default: 0
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    totalRevenue: {
      type: Number,
      default: 0
    },

    kycDocuments: {
      aadhaar: {
        number: String,
        document: {
          public_id: String,
          url: String
        }
      },
      pan: {
        number: String,
        document: {
          public_id: String,
          url: String
        }
      }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// INDEXES
farmerSchema.index({ location: "2dsphere" });
farmerSchema.index({ isApproved: 1 });
farmerSchema.index({ isFeatured: 1 });
farmerSchema.index({ "rating.average": -1 });

// Generate slug
farmerSchema.pre("save", function (next) {
  if (this.isModified("farmName")) {
    this.slug = this.farmName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  next();
});

module.exports = mongoose.model("Farmer", farmerSchema);