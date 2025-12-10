export default function AdminDashboard() {
  return (
    <main className="space-y-10">

      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-gray-900">
        Admin Dashboard
      </h1>

      {/* Card 1 */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome, Admin
        </h2>
        <p className="text-gray-700 text-[15px] leading-relaxed">
          Manage users, posts, and system settings from here.
          Use the panel on the left to navigate between admin tools.
        </p>
      </section>

      {/* Card 2 */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="border p-4 rounded-lg bg-[#FAFAFA] hover:bg-[#F3F3F3] transition cursor-pointer">
            <p className="text-gray-700 font-medium">Manage Users</p>
          </div>

          <div className="border p-4 rounded-lg bg-[#FAFAFA] hover:bg-[#F3F3F3] transition cursor-pointer">
            <p className="text-gray-700 font-medium">View All Blogs</p>
          </div>

          <div className="border p-4 rounded-lg bg-[#FAFAFA] hover:bg-[#F3F3F3] transition cursor-pointer">
            <p className="text-gray-700 font-medium">Website Settings</p>
          </div>

        </div>
      </section>

      {/* Card 3 */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          System Notice
        </h2>

        <p className="text-gray-700 text-sm leading-relaxed">
          No new alerts. Everything is running smoothly!
        </p>
      </section>

    </main>
  );
}
