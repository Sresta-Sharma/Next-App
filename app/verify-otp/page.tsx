" use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

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

        const email = localStorage.getItem("email_for_otp");
        if (!email) {
            alert("Email missing! Restart login/reset process.");
            return;
        }

        try{
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    otp: data.otp
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || "Invalid OTP!");
                setLoading(false);
                return;
            }

            alert("OTP verified successfully!");

            // Save tokens and user data
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.user));
            
            router.push("/reset-password");
        }
        catch(err){
            console.log(err);
            alert("Something went wrong. Try again!");
        }

        setLoading(false);
    };
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Verify OTP</h2>
        <p className="text-center text-gray-600 mb-4">
          Enter the 6-digit OTP sent to your email.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Didn’t receive the OTP?{" "}
          <button className="text-blue-600 hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}