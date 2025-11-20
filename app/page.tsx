import Link from "next/link";

export default function HomePage(){
  return(
    <main className="min-h-screen bg-white text-gray-900">

      {/* hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-bold">
          Welcome to my App
        </h2>

        <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
          A simple, modern and fully responsive full-stack app built using Next.js.
          Clean UI, secure backend, and great user experience.
        </p>

        <div className="mt-10 flex justify-center space-x-4">
          <Link href="/register" className="px-12 py-3 border border-gray-400 rounded-lg bg-gray-100 text-lg hover:bg-gray-200 transition">
          Register
          </Link>

          <Link href="/contact" className="px-12 py-3 border border-gray-400 rounded-lg bg-gray-100 text-lg hover:bg-gray-200 transition">
          Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}