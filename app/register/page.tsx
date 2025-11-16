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
  const onSubmit: SubmitHandler<RegisterInputs> = (data) => {
    alert(`Welcome, ${data.name}!`);
    console.log("User data: ", data);

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "2.5rem",
        borderRadius: "15px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        background: "#ffffff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "1.5rem",
        }}
      >
        Create an Account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Input Wrapper Style */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
            }}
          />
          {errors.name && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
            }}
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div style={{ marginBottom: "1rem" }}>
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
            style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: errors.phone ? "1px solid red" : "1px solid #ccc",
                outline: "none",
                fontSize: "15px",
            }}
            />
            {errors.phone && <p style={{ color: "red", fontSize: "13px", marginTop: "5px"}}>
                {errors.phone.message}
                </p>}
        </div>

        {/* Password field */}
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
              pattern: {
                // Must not start with a space and must include at least 1 special character
                value: /^(?!\s)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                message: "Password must not start with space and must include at least one special character",
              },
            })}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: errors.password ? "1px solid red" : "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#555",
              fontSize: "13px",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {errors.password && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#555",
              fontSize: "13px",
            }}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
          {errors.confirmPassword && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "12px",
            background: "linear-gradient(90deg, #007BFF, #0056D2)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Register
        </button>
      </form>
    </div>
  );
}