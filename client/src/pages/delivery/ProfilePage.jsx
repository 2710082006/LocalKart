import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Truck, MapPin, Save, CreditCard } from "lucide-react";
import { deliveryAPI } from "../../api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const [paymentData, setPaymentData] = useState({
    upiId: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const { data } = useQuery({
    queryKey: ["deliveryProfile", user?._id || user?.id],
    queryFn: () => deliveryAPI.getDashboard().then((r) => r.data),
    enabled: !!(user?._id || user?.id),
    retry: false,
  });

  const agent = data?.data?.agent || data?.agent || null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleType: "motorcycle",
      vehicleNumber: "",
      licenseNumber: "",
      zone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (!agent) return;

    reset({
      vehicleType: agent?.vehicleType || "motorcycle",
      vehicleNumber: agent?.vehicleNumber || "",
      licenseNumber: agent?.licenseNumber || "",
      zone: agent?.zone || "",
      address: agent?.address?.street || "",
      city: agent?.address?.city || "",
      state: agent?.address?.state || "",
      pincode: agent?.address?.pincode || "",
    });

    setPaymentData({
      upiId: agent?.bankDetails?.upiId || "",
      bankName: agent?.bankDetails?.bankName || "",
      accountHolderName: agent?.bankDetails?.accountHolderName || "",
      accountNumber: agent?.bankDetails?.accountNumber || "",
      ifscCode: agent?.bankDetails?.ifscCode || "",
    });
  }, [agent, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      return await deliveryAPI.updateProfile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deliveryProfile", user?._id || user?.id],
      });
      toast.success("Profile details updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber,
      licenseNumber: formData.licenseNumber,
      zone: formData.zone,
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      bankDetails: {
        upiId: paymentData.upiId,
        bankName: paymentData.bankName,
        accountHolderName: paymentData.accountHolderName,
        accountNumber: paymentData.accountNumber,
        ifscCode: paymentData.ifscCode,
      },
    });
  };

  return (
    <div id="delivery-profile">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">
        Delivery Profile
      </h1>

      <p className="text-neutral-500 text-sm mb-6">
        Manage your vehicle details, location, and payment information
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Profile Header */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {user?.name}
              </h2>

              <p className="text-sm text-neutral-500">{user?.email}</p>

              <span className="badge badge-purple mt-1">Delivery Agent</span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-500" />
            Vehicle Details
          </h3>

          <div className="space-y-4">
            <select
              {...register("vehicleType")}
              className="input"
            >
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="auto">Auto Rickshaw</option>
              <option value="van">Van</option>
            </select>

            <input
              {...register("vehicleNumber")}
              className="input"
              placeholder="Vehicle Number (e.g. MH 01 AB 1234)"
            />

            <input
              {...register("licenseNumber")}
              className="input"
              placeholder="License Number"
            />

            <input
              {...register("zone")}
              className="input"
              placeholder="Operating Zone / Area"
            />
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            Base Address
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            This address will be used to assign nearby orders to you.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <input {...register("address", { required: true })} className="input" placeholder="Street Address" />
            <input {...register("city", { required: true })} className="input" placeholder="City" />
            <input {...register("state", { required: true })} className="input" placeholder="State" />
            <input {...register("pincode", { required: true })} className="input" placeholder="Pincode" />
          </div>
        </div>

        {/* Payment Details */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Bank Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={paymentData.upiId}
              onChange={(e) =>
                setPaymentData({ ...paymentData, upiId: e.target.value })
              }
              className="input"
              placeholder="UPI ID"
            />

            <input
              value={paymentData.bankName}
              onChange={(e) =>
                setPaymentData({ ...paymentData, bankName: e.target.value })
              }
              className="input"
              placeholder="Bank Name"
            />

            <input
              value={paymentData.accountHolderName}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  accountHolderName: e.target.value,
                })
              }
              className="input"
              placeholder="Account Holder"
            />

            <input
              value={paymentData.accountNumber}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  accountNumber: e.target.value,
                })
              }
              className="input"
              placeholder="Account Number"
            />

            <input
              value={paymentData.ifscCode}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  ifscCode: e.target.value,
                })
              }
              className="input"
              placeholder="IFSC Code"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary !py-3.5"
        >
          {mutation.isPending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
