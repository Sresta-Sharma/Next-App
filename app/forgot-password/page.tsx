"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess("OTP has been sent to your email");
      setLoading(false);

      // Redirect to reset-password page (user will enter email + otp + new password)
      setTimeout(() => {
        router.push("/reset-password");
      }, 1000);

    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-30">

          <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">
            Forgot Password
          </h2>

          {/* SUCCESS */}
          {success && (
            <p className="text-green-600 text-sm text-center mb-4">
              {success}
            </p>
          )}

          {/* ERROR */}
          {error && (
            <p className="text-red-600 text-sm text-center mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
                transition focus:border-[#1A1A1A]
                ${error ? "border-red-500" : "border-gray-300"}
              `}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border border-[#1A1A1A] rounded-full 
              text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
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
