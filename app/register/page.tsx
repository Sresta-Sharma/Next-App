"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterInputs = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInputs>({
    defaultValues: { countryCode: "+977" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch("password");

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const fullphone = `${data.countryCode}${data.phone}`;

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: fullphone,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Registration failed");
        return;
      }

      alert("Registration successful!");
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-10">

        <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Full Name */}
          <div>
            <input
              placeholder="Full Name"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "At least 2 characters" },
                pattern: {
                  value: /^[A-Za-z ]+$/,
                  message: "Only letters allowed",
                },
              })}
              className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                transition focus:border-[#1A1A1A]
                ${errors.name ? "border-red-500" : "border-gray-300"}
              `}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Invalid email",
                },
              })}
              className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                transition focus:border-[#1A1A1A]
                ${errors.email ? "border-red-500" : "border-gray-300"}
              `}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="flex gap-3">
              <select
                {...register("countryCode")}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white 
                focus:border-[#1A1A1A] outline-none"
              >
                <option value="+977">+977</option>
                <option value="+91">+91</option>
                <option value="+86">+86</option>
                <option value="+975">+975</option>
              </select>

              <input
                placeholder="Phone (10 digits)"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Must be 10 digits",
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                  transition focus:border-[#1A1A1A]
                  ${errors.phone ? "border-red-500" : "border-gray-300"}
                `}
              />
            </div>

            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
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
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                transition focus:border-[#1A1A1A]
                ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}
              `}
            />

            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium cursor-pointer text-[#347970]"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "HIDE" : "SHOW"}
            </span>

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 border border-[#1A1A1A] rounded-full 
            text-sm font-medium hover:bg-gray-100 transition"
          >
            Register
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              className="text-[#111] font-semibold underline cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  </div>
  );
}
