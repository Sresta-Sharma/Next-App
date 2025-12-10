"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type OTPInputs = {
    otp: string;
};

export default function VerifyOtpPage() {

    const[ loading, setLoading ] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState : {errors},
    } = useForm<OTPInputs>();

    const onSubmit: SubmitHandler<OTPInputs> = async (data) => {
        setLoading(true);

        // Read stored data
        const email = localStorage.getItem("pending_email");
        const purpose = localStorage.getItem("pending_purpose"); // login or reset
        
        if (!email || !purpose) {
            toast.error("Missing verification data! Restart the process.");
            setLoading(false);
            return;
        }

        try{
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp: data.otp,
                    purpose,  //backend expects "purpose"
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || result.message || "Invalid OTP!");
                setLoading(false);
                return;
            }

            // If login: store tokens and redirect
            if (purpose === "login" && result.accessToken && result.user) {
              localStorage.setItem("accessToken", result.accessToken || "");
              localStorage.setItem("refreshToken", result.refreshToken || "");
              localStorage.setItem("user", JSON.stringify(result.user));
            
              // cleanup
              localStorage.removeItem("pending_email");
              localStorage.removeItem("pending_purpose");

              const role = result.user.role?.toLowerCase();

              toast.success("Login successful!");
              setLoading(false);
            
              // Redirect based on role
              if (role === "admin") {
                router.push("/dashboard");
              } else {
                router.push("/user/dashboard");
              }

              return;
            }
        
            // If reset-password
            if (purpose === "reset") {
              // save otp so that reset page can call reset-password
              localStorage.setItem("pending_reset_otp", data.otp);

              // remove purpose but keep pending_email since we'll use it in reset
              localStorage.removeItem("pending_purpose");

              toast.success("OTP verified. You may now reset your password.");
              setLoading(false);
              router.push("/reset-password");
              return;
            }

            toast.error("Unexpected response from server!");
          } catch(err){
            console.log(err);
            toast.error("Something went wrong. Try again!");
        }

        setLoading(false);
    };
    return (
    <div className="min-h-screen bg-white">
       <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-30">
        
        <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-2">Verify OTP</h2>
       
        <p className="text-center text-gray-600 mb-6 text-sm">
          Enter the 6-digit OTP sent to your email.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              className={`w-full px-4 py-3 rounded-lg text -sm border outline-none bg-white
              transition focus: border-[#1A1A1A]
              ${errors.otp ? "border-red-500" : "border-gray-300"}`}
              {...register("otp", {
                required: "OTP is required",
                minLength: {
                  value: 6,
                  message: "OTP must be 6 digits",
                },
                maxLength: {
                  value: 6,
                  message: "OTP must be 6 digits",
                },
              })}
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 border border-[#1A1A1A] rounded-full 
            text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Back to Login */}
            <p className="text-center text-sm text-gray-600">
              Wrong email?{" "}
              <span
                className="text-[#111] font-semibold underline cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Login
              </span>
            </p>
        </form>
        </div>
      </div>
    </div>
  );
}