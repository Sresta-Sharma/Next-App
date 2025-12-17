"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type ResetInputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const password = watch("password");

  const onSubmit: SubmitHandler<ResetInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const email = localStorage.getItem("pending_email");
    const otp = localStorage.getItem("pending_reset_otp");

    if (!email || !otp){
      toast.error("Verification missing! Restart reset process.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || result.message || "Password reset failed");
        setLoading(false);
        return;
      }

      // cleanup
      localStorage.removeItem("pending_email");
      localStorage.removeItem("pending_reset_otp");

      toast.success("Password reset successful! Please login.");
      router.push("/login");

    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-30">

        <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">Set New Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Password */}
          <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            {...register("password", { 
              required: "Password is required", 
              minLength: {
                value:6,
                message: "Must be at least 6 characters",
              },
              pattern: {
                value: /^(?!\s)(?=.*[!@#$%^&*]).{6,}$/,
                message: "Must include a special character",
              },
            })}
            className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
            transition focus:border-[#1A1A1A] 
            ${errors.password ? "border-red-500" : "border-gray-300"}
            `}

          />
          <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
          onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </span>
        
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", { 
                required: "Confirm your password", 
                validate: (value) =>
                value === password || "Passwords do not match",
                })}
              className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
              transition focus:border-[#1A1A1A]
              ${errors.password ? "border-red-500" : "border-gray-300"}
              `}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? "HIDE" : "SHOW"}
            </span>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-[#1A1A1A] rounded-full 
            text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>
      </div>
    </div>
  </div>
  );
}
