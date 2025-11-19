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
    const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
        try{
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            // If backend returned an error
            if (!response.ok){
                alert(result.error || "Login failed");
                return;
            }

            // Save token in local storage
            localStorage.setItem("token", result.token);

            //Save user details to not later fetch from backend on every page
            localStorage.setItem("user", JSON.stringify(result.user));
            
            alert("Login successful!");

            router.push("/dashboard");
        } catch(error){
            console.error("Login error: ",error);
            alert("Something went wrong. Try again!");
        }
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
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                <input
                type={showPassword ? "text": "password"}
                placeholder="Password"
                {...register("password", {
                    required: "Password is required",
                })}
                style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
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
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "13px",
                    color: "oklch(42.4% 0.199 265.638)",
                    fontWeight: "500",
                    background: "transparent",
                    cursor: "pointer",
                    userSelect: "none",
                    paddingLeft: "4px",
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
                background: "oklch(42.4% 0.199 265.638)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "oklch(48.8% 0.243 264.376)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "oklch(42.4% 0.199 265.638)")}
            >
                Login
            </button>

            {/* Register Link */}
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#555" }}>
                    Don't have an account? {" "}
                    <span onClick={() => router.push("/register")}
                    style={{
                        color: "oklch(42.4% 0.199 265.638)",
                        cursor: "pointer",
                        fontWeight: "600",
                    }}>
                        Register
                    </span>
                </p>
            </div>
            </form>   
        </div>
    );
}