"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

type RegisterInputs = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  // initialize form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInputs>();

  // watch password to validate confirmPassword
  const password = watch("password", "");

  // for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  
  // Function that runs on submit
  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    
    // Frontend confirmPassword check
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try{
      
      // Send user data to backend API
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await response.json();

      // API returned an error
      if (!response.ok) {
        alert(result.error || "Registration failed");
        return;
      }

      // Success
      alert("Registration successful!");
      console.log("Backend response: ",result);

      // Redirect to login page
      router.push("/login");
    } catch(err){
      console.error("Registration error: ",err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
     <div className="max-w-[400px] mx-auto mt-16 p-10 rounded-[15px] shadow-lg bg-white font-[Segoe_UI]">
      <h2 className="text-center text-[#222] mb-6 text-[1.6rem] font-bold">
        Create an Account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div className="mb-4">
          <input
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-[15px] outline-none ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value:
                  /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-[15px] outline-none ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <input
            type="tel"
            placeholder="Phone Number"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^(?:\+977)?9\d{9}$/,
                message: "Invalid phone number (must start with 9 and be 10 digits)",
              },
            })}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-[15px] outline-none ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <div className="relative min-h-[42px]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "At least 6 characters",
                },
                pattern: {
                  value: /^(?!\s)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                  message:
                    "Password must not start with space and must include at least one special character",
                },
              })}
              className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-[15px] outline-none ${
                errors.password ? "border-red-500" : ""
              }`}
            />

            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium cursor-pointer text-blue-700 select-none"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          {errors.password && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <div className="relative min-h-[42px]">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-[15px] outline-none ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />

            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium cursor-pointer text-blue-700 select-none"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "HIDE" : "SHOW"}
            </span>
          </div>

          {errors.confirmPassword && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-3 w-full py-3 bg-blue-700 text-white rounded-lg text-[16px] font-semibold cursor-pointer transition hover:bg-blue-800"
        >
          Register
        </button>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <p className="text-[14px] text-gray-600">
            Already have an account?{" "}
            <span
              className="text-blue-700 font-semibold cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}