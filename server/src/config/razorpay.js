const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });
  }
  return razorpayInstance;
};

module.exports = { getRazorpay };
