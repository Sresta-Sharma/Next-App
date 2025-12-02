"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginInputs = {
  email: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  step?: "OTP_REQUIRED" | "SUCCESS";
  user?: {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "user";
  };
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });

      const result: LoginResponse = await response.json();
      console.log("LOGIN RESPONSE:", result);

      if (!response.ok) {
        alert(result.error || "Login failed");
        return;
      }

      if (result.step === "OTP_REQUIRED") {
          localStorage.setItem("email_for_otp", data.email);

          alert("OTP sent to your email!");
          router.push("/verify-otp");
          return; // VERY IMPORTANT
        }
      
      if (!result.user) {
        alert("User data missing from response");
        return;
      }

      // Remove old values
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Store new tokens returned by backend
      localStorage.setItem("accessToken", result.accessToken || "");
      localStorage.setItem("refreshToken", result.refreshToken || "");

      // Store user
      localStorage.setItem("user", JSON.stringify(result.user));

      alert("Login successful!");

      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-30">

          <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">
            Login
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <input
                type="text"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format",
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

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                transition focus:border-[#1A1A1A]
                ${errors.password ? "border-red-500" : "border-gray-300"}
              `}
              />

              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium 
              cursor-pointer text-[#347970]"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </span>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right -mt-3">
              <span onClick={() => router.push("/forgot-password")}
              className="text-sm text-[#393e3d] font-medium cursor-pointer underline"
              > Forgot Password?</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 border border-[#1A1A1A] rounded-full 
            text-sm font-medium hover:bg-gray-100 transition"
            >
              Login
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <span
                className="text-[#111] font-semibold underline cursor-pointer"
                onClick={() => router.push("/register")}
              >
                Sign Up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
