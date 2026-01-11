"use client";

import { useState } from "react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+977",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  // Yup schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required!")
      .min(2, "At least 2 characters")
      .matches(/^[A-Za-z ]+$/, "Only letters allowed"),

    lastName: Yup.string()
      .required("Last name is required!")
      .min(2, "At least 2 characters")
      .matches(/^[A-Za-z ]+$/, "Only letters allowed"),

    email: Yup.string().test(
      "email-or-phone",
      "Invalid email address!",
      (value) => {
        if (!value || value.trim() === "") return true;
        const emailRegex =
          /^[A-Za-z0-9](?!.*\.\.)[A-Za-z0-9._-]*[A-Za-z0-9]@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(value);
      }
    ),

    phone: Yup.string().test("phone-or-email", function (value) {
      const { email } = this.parent;

      if ((!value || value.trim() === "") && (!email || email.trim() === "")) {
        return this.createError({
          message: "Either email or phone number is required!",
        });
      }

      if (value && !/^\d{10}$/.test(value)) {
        return this.createError({
          message: "Phone number must be 10 digits!",
        });
      }

      return true;
    }),

    message: Yup.string()
      .required("Message is required!")
      .min(10, "At least 10 characters"),
  });

  // Handle change
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to submit?");
    if (!confirmed) return;
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      // Submit to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Message sent successfully!");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "+977",
          message: "",
        });
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (err: any) {
      if (err.inner) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((error: any) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-16 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-[#1A1A1A]/20 shadow-sm shadow-[#000]/10 -mt-10">

          <h2 className="text-center text-2xl font-bold text-[#111] tracking-tight mb-8">
            Contact Us
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* First Name */}
            <div>
              <input
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
                  transition focus:border-[#1A1A1A]
                  ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
                  transition focus:border-[#1A1A1A]
                  ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white
                  transition focus:border-[#1A1A1A]
                  ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className="flex gap-3">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white 
                focus:border-[#1A1A1A] outline-none"
                >
                  <option value="+977">+977</option>
                  <option value="+91">+91</option>
                  <option value="+86">+86</option>
                  <option value="+975">+975</option>
                </select>

                <input
                  placeholder="Phone (10 digits)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white 
                    transition focus:border-[#1A1A1A]
                    ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <textarea
                placeholder="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-sm border outline-none bg-white min-h-[120px]
                  transition focus:border-[#1A1A1A]
                  ${errors.message ? "border-red-500" : "border-gray-300"}`}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 border border-[#1A1A1A] rounded-full 
              text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
