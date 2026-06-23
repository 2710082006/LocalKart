import api from "../api";

export const updatePaymentDetails = async (paymentData) => {
  const response = await api.put(
    "/farmers/payment-details",
    paymentData
  );

  return response.data;
};