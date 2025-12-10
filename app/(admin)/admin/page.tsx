export default function AdminDashboard() {
  return (
    <section className="w-full">

      {/* Heading + Description */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-lg text-[#737373] max-w-2xl leading-relaxed">
          Welcome to the control center. Manage users, moderate content, and
          configure website settings — all from one clean, simple dashboard.
        </p>
      </div>

      {/* Overview Card */}
      <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Overview
        </h2>

        <p className="text-gray-700 leading-relaxed text-[16px]">
          This panel helps you keep the platform running smoothly. Use the
          sidebar to navigate between user management, blog moderation, and
          system settings.
        </p>
      </div>

    </section>
  );
}
