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
        <div className="max-w-[400px] mx-auto mt-16 p-10 rounded-[15px] shadow-[0_8px_25px_rgba(0,0,0,0.1)] bg-white font-[Segoe_UI]">
      <h2 className="text-center text-[#222] mb-6 text-[1.6rem] font-bold">
        Login
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value:
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email format",
              },
            })}
            className={`w-full px-3 py-[10px] rounded-lg border text-[15px] outline-none ${
              errors.email ? "border-red-500" : "border-[#ccc]"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative min-h-[42px]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
            })}
            className={`w-full px-3 py-[10px] rounded-lg border text-[15px] outline-none ${
              errors.password ? "border-red-500" : "border-[#ccc]"
            }`}
          />

          {/* SHOW / HIDE */}
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium cursor-pointer text-[oklch(42.4%_0.199_265.638)] select-none"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </span>

          {errors.password && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-3 w-full py-3 bg-blue-700 text-white rounded-lg text-[16px] font-semibold cursor-pointer transition hover:bg-blue-800"
        >
          Login
        </button>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <p className="text-[14px] text-[#555]">
            Don't have an account?{" "}
            <span
              className="text-[oklch(42.4%_0.199_265.638)] font-semibold cursor-pointer"
              onClick={() => router.push("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </form>
    </div>
    );
}