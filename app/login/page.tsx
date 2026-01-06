"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already authenticated via OAuth
  useEffect(() => {
    const handleOAuthSuccess = async () => {
      if (status === "authenticated" && (session as any)?.isOAuth && session.user?.email) {
        try {
          // Fetch tokens from backend using the Google email
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              oauth_id: session.user.email, // Use email as fallback
              avatar: session.user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store tokens
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            toast.success("Logged in with Google!");
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching tokens:", error);
          toast.error("Login failed");
        }
      }
    };

    handleOAuthSuccess();
  }, [status, session, router]);

  const onSubmit: SubmitHandler<LoginInputs> = async (data, event) => {
    // Extra guard to prevent default navigation/query params if JS hiccups
    event?.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.identifier, password: data.password }),
        cache: "no-store",
      });

      const result = (await response.json()) as LoginResponse;
      console.log("LOGIN RESPONSE:", result);

      if (!response.ok) {
        toast.error(result.error || "Login failed!");
        setLoading(false);
        return;
      }

      // As backend requires OTP
      if (result.step === "OTP_REQUIRED") {
          
          // Save email + purpose for verify-otp
          localStorage.setItem("pending_email", data.identifier);
          localStorage.setItem("pending_purpose", "login");
          
          toast.success("OTP sent to your email! Please verify!");
          setLoading(false);
          router.push("/verify-otp");
          return; // VERY IMPORTANT
        }
      
      // If token returned directly  
      if (!result.user) {
        toast.error("User data missing from response!");
        setLoading(false);
        return;
      }

      // Store new tokens returned by backend if backend sends tokens directly
      if (result.accessToken && result.user) {
        localStorage.setItem("accessToken", result.accessToken || "");
        localStorage.setItem("refreshToken", result.refreshToken || "");

        // Store user
        localStorage.setItem("user", JSON.stringify(result.user));

        toast.success("Login successful!");
        setLoading(false);

        router.push("/dashboard");
        return;
      }
      toast.error("Unexpected response from server.");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-30">

          <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">
            Login
          </h2>

          <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
            text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="absolute bg-white px-3 text-xs text-gray-500">OR</span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3 border border-gray-300 rounded-full 
                text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 
                flex items-center justify-center gap-2"
            >
              <FcGoogle className="text-xl" />
              {googleLoading ? "Signing in..." : "Continue with Google"}
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
