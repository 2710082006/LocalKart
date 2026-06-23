import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Leaf, MapPin, Save, CreditCard } from "lucide-react";
import { farmerAPI } from "../../api";
import toast from "react-hot-toast";
import { updatePaymentDetails } from "../../services/farmerService";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const [paymentData, setPaymentData] = useState({
    upiId: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
  });

  const { data } = useQuery({
  queryKey: ["farmerProfile", user?._id || user?.id],
  queryFn: () => farmerAPI.getDashboard().then((r) => r.data),
  enabled: !!(user?._id || user?.id),
  retry: false,
});

  const farmer = data?.data?.farmer || data?.data || null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      farmName: "",
      description: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      specialties: "",
    },
  });

  useEffect(() => {
    if (!farmer) {
      reset({
        farmName: "",
        description: "",
        specialties: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
      });

      setPaymentData({
        upiId: "",
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
      });

      return;
    }

    reset({
      farmName: farmer?.farmName || "",
      description: farmer?.description || "",
      specialties: Array.isArray(farmer?.specialties)
        ? farmer.specialties.join(", ")
        : farmer?.specialties || "",
      address: farmer?.location?.address || "",
      city: farmer?.location?.city || "",
      state: farmer?.location?.state || "",
      pincode: farmer?.location?.pincode || "",
      phone: farmer?.phone || "",
    });

    setPaymentData({
      upiId: farmer?.paymentDetails?.upiId || "",
      bankName: farmer?.paymentDetails?.bankName || "",
      accountHolder: farmer?.paymentDetails?.accountHolder || "",
      accountNumber: farmer?.paymentDetails?.accountNumber || "",
      ifscCode: farmer?.paymentDetails?.ifscCode || "",
    });
  }, [farmer, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      await farmerAPI.updateProfile(formData);

      await updatePaymentDetails({
        upiId: paymentData.upiId,
        bankName: paymentData.bankName,
        accountHolderName: paymentData.accountHolder,
        accountNumber: paymentData.accountNumber,
        ifscCode: paymentData.ifscCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["farmerProfile", user?._id || user?.id],
      });
      toast.success("Profile & payment details updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({
      ...formData,
      specialties: formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },

      paymentDetails: {
        upiId: paymentData.upiId,
        bankName: paymentData.bankName,
        accountHolder: paymentData.accountHolder,
        accountNumber: paymentData.accountNumber,
        ifscCode: paymentData.ifscCode,
      },
    });
  };

  return (
    <div id="farmer-profile">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">
        Farm Profile
      </h1>

      <p className="text-neutral-500 text-sm mb-6">
        Manage your farm details and payment information
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Profile Header */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {user?.name}
              </h2>

              <p className="text-sm text-neutral-500">{user?.email}</p>

              <span className="badge badge-green mt-1">Farmer</span>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Farm Details
          </h3>

          <div className="space-y-4">
            <input
              {...register("farmName", {
                required: "Farm name is required",
              })}
              className={`input ${errors.farmName ? "input-error" : ""}`}
              placeholder="Farm Name"
            />

            <textarea
              {...register("description")}
              className="input min-h-[100px]"
              placeholder="Farm description"
            />

            <input
              {...register("specialties")}
              className="input"
              placeholder="Specialties"
            />
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            Location
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <input {...register("address")} className="input" placeholder="Address" />
            <input {...register("city")} className="input" placeholder="City" />
            <input {...register("state")} className="input" placeholder="State" />
            <input {...register("pincode")} className="input" placeholder="Pincode" />
            <input {...register("phone")} className="input" placeholder="Phone" />
          </div>
        </div>

        {/* Payment Details */}
        <div className="card p-6">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            Payment Details
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
              value={paymentData.accountHolder}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  accountHolder: e.target.value,
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
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}