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
      .notRequired()
      .test(
        "min-if-filled",
        "Message must be at least 10 characters long!",
        (value) => {
          if (!value || value.trim() === "") return true;
          return value.trim().length >= 10;
        }
      ),
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Contact Form</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
      >
        {/* First Name */}
        <label htmlFor="firstName" className="text-blue-800 font-medium">
          First Name <span className="text-red-600">*</span>
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}

        {/* Last Name */}
        <label htmlFor="lastName" className="text-blue-800 font-medium">
          Last Name <span className="text-red-600">*</span>
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}

        {/* Email */}
        <label htmlFor="email" className="text-blue-800 font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* Phone */}
        <label htmlFor="phone" className="text-blue-800 font-medium">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        {/* Message */}
        <label htmlFor="message" className="text-blue-800 font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}

        <button
          type="submit"
          className="bg-blue-300 text-white p-2 rounded hover:bg-amber-500 transition"
        >
          Submit
        </button>
      </form>

      {formSubmitted && (
        <div className="mt-6 text-green-400 font-semibold">
          Thank you, {formData.firstName} {formData.lastName}! <br />
          Your form has been submitted successfully.
        </div>
      )}
    </main>
  );
}
