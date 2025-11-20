'use client';

import { useState } from "react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

export default function Home() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  
  // Yup validation schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required!")
      .min(2, "First name must be at least 2 characters!"),

    lastName: Yup.string()
      .required("Last name is required!")
      .min(2, "Last name must be at least 2 characters!"),

    email: Yup.string().test(
      "email-or-phone",
      "Invalid email address!",
      (value) => {
        if (!value || value.trim() === "") return true; 

        const emailRegex =
          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        return emailRegex.test(value);
      }
    ),

    phone: Yup.string().test(
      "phone-or-email",
      function (value) {
        const { email } = this.parent;

        // Require at least one (email or phone)
        if ((!value || value.trim() === "") && (!email || email.trim() === "")) {
          return this.createError({
            message: "Either email or phone number is required!",
          });
        }

        // If phone is provided, must be 10 digits
        if (value && value.trim() !== "" && !/^(?:\+?\d{1,3})?\d{10,}$/.test(value)) {
          return this.createError({
            message: "Phone number must be 10 digits!",
          });
        }

        return true;
      }
    ),

    message: Yup.string()
      .required("Message is required!")
      .min(10, "Message must be at least 10 characters long!"),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setFormSubmitted(true);

      router.push("/success");
    } catch (err: any) {
  console.error("Validation Error:", err);
  const newErrors: { [key: string]: string } = {};

  if (err.inner && Array.isArray(err.inner)) {
    err.inner.forEach((error: any) => {
      newErrors[error.path] = error.message;
    });
  } else if (err.path && err.message) {
    newErrors[err.path] = err.message;
  }

  setErrors(newErrors);
  setFormSubmitted(false);
}

  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg bg-white shadow-sm rounded-2xl p-8 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Contact Form
        </h1>

        <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5">

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email 
            </label>
            <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
              Phone
            </label>
            <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
            id="message"
            name="message"
            placeholder="Write your message"
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <button
          type="submit"
          className="mt-3 w-full py-3 bg-blue-700 text-white rounded-lg text-[16px] font-semibold cursor-pointer transition hover:bg-blue-800"
          >
            Submit
          </button>
        </form>

        {formSubmitted && (
          <div className="mt-5 text-green-600 font-medium text-center">
            Thank you, {formData.firstName} {formData.lastName}!<br />
            Your form has been submitted.
      </div>
      )}
      </div>
    </main>
  );
}
