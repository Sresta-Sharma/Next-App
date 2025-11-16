"use client";

import { useForm, SubmitHandler} from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginInputs = {
    email: string;
    password: string;
};

export default function LoginPage(){
    const router = useRouter();
    
    const{
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginInputs>();

    const [showPassword, setShowPassword] = useState(false);

    //When form is submitted
    const onSubmit: SubmitHandler<LoginInputs> = (data) => {
        alert(`Welcome back, ${data.email}!`);
        console.log("Login data: ", data);
        router.push("/dashboard");
    };

    return(
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
                fontSize: "28px",
                fontWeight: "600",
            }}
            >
                Login
            </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: "1rem"}}>
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
                style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: errors.email ? "1px solid red" : "1px solid #ccc",
                    outline: "none",
                    fontSize: "15px",
                    transition: "border 0.2s ease",
                }}
                />
                {errors.email && <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
                    {errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1rem", position: "relative" }}>
                <input
                type={showPassword ? "text": "password"}
                placeholder="Password"
                {...register("password", {
                    required: "Password is required",
                })}
                style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: errors.password ? "1px solid red" : "1px solid #ccc",
                    outline: "none",
                    fontSize: "15px",
                    transition: "border 0.2s ease",
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
                {errors.password && <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
                    {errors.password.message}
                    </p>}
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            style={{
                marginTop: "10px",
                width: "100%",
                padding: "12px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0059c1")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#0070f3")}
            >
                Login
            </button>

            {/* Register Link */}
            <p style={{
                textAlign: "center",
                marginTop: "1.2rem",
                fontSize: "14px",
                color: "#555",
            }}
            >
                Don't have an account? {" "}
                <a
                href="/register"
                style={{
                    color: "#0070f3",
                    textDecoration: "none",
                    fontWeight: "500",
                }}
                >
                    Register Here
                </a>
            </p>
            </form>   
        </div>
    );
}