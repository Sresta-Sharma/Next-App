"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginInputs = {
  identifier: string; // email
  password: string;
};

type LoginResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  step?: "OTP_REQUIRED" | "SUCCESS";
  otp_id?: string;
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
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.identifier, password: data.password }),
        cache: "no-store",
      });

      const result: LoginResponse = await response.json();
      console.log("LOGIN RESPONSE:", result);

      if (!response.ok) {
        alert(result.error || "Login failed");
        return;
      }

      // As backend requires OTP
      if (result.step === "OTP_REQUIRED") {
          
          // Sve email + purpose for verify-otp
          localStorage.setItem("pending_email", data.identifier);
          localStorage.setItem("pending_purpose", "login");
          
          alert("OTP sent to your email! Please verify!");
          setLoading(false);
          router.push("/verify-otp");
          return; // VERY IMPORTANT
        }
      
      // If token returned directly  
      if (!result.user) {
        alert("User data missing from response");
        return;
      }

      // Store new tokens returned by backend if backend sends tokens directly
      if (result.accessToken && result.user) {
        localStorage.setItem("accessToken", result.accessToken || "");
        localStorage.setItem("refreshToken", result.refreshToken || "");

        // Store user
        localStorage.setItem("user", JSON.stringify(result.user));

        alert("Login successful!");
        setLoading(false);

        if (result.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        return;
      }
      alert("Unexpected response from server.");
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
                {...register("identifier", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email format",
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                transition focus:border-[#1A1A1A] 
                ${errors.identifier ? "border-red-500" : "border-gray-300"}
              `}
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
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
              disabled={loading}
              className="w-full py-3 border border-[#1A1A1A] rounded-full 
            text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
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
