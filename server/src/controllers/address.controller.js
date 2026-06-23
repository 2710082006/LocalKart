const Address = require('../models/Address');
const { asyncHandler } = require('../utils/helpers');
const axios = require("axios");

// @desc    Get user addresses
// @route   GET /api/v1/addresses
exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, count: addresses.length, data: addresses });
});

// @desc    Create address
// @route   POST /api/v1/addresses
exports.createAddress = asyncHandler(async (req, res) => {
  req.body.userId = req.user.id;

  const { street, city, state, pincode } = req.body;

  // Build full address
  const fullAddress = `${street}, ${city}, ${state}, ${pincode}`;

  // Geocode with Google Maps
  const geoRes = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    }
  );

  let location = {
    type: "Point",
    coordinates: [0, 0],
  };

  if (geoRes.data.results.length > 0) {
    const { lat, lng } = geoRes.data.results[0].geometry.location;

    location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  req.body.location = location;

  // First address = default
  const count = await Address.countDocuments({
    userId: req.user.id,
  });

  if (count === 0) {
    req.body.isDefault = true;
  }

  const address = await Address.create(req.body);

  res.status(201).json({
    success: true,
    data: address,
  });
});

// @desc    Update address
// @route   PUT /api/v1/addresses/:id
exports.updateAddress = asyncHandler(async (req, res) => {
  let address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  if (address.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  address = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: address });
});

// @desc    Delete address
// @route   DELETE /api/v1/addresses/:id
exports.deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  if (address.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await address.deleteOne();

  // If deleted address was default, set next one as default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  res.json({ success: true, message: 'Address deleted' });
});

// @desc    Set default address
// @route   PUT /api/v1/addresses/:id/default
exports.setDefault = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  if (address.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Reset all addresses then set this one
  await Address.updateMany({ userId: req.user.id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.json({ success: true, data: address });
});

// @desc    Get single address
// @route   GET /api/v1/addresses/:id
exports.getAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  if (address.userId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: address });
});
