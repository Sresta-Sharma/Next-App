import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#111111] mb-6">
          About Beautiful Mess
        </h1>

        {/* Intro */}
        <p className="text-base leading-relaxed text-gray-700 mb-6">
          Beautiful Mess is a space where ideas collide, evolve, and take shape.
          Here, I write about technology, personal growth, challenges,
          experiences, small victories, and the lessons hidden inside the chaos
          of everyday life.
        </p>

        <p className="text-base leading-relaxed text-gray-700 mb-10">
          Some posts are technical. Some are reflective. Some are just thoughts
          I needed to share. This space isn’t perfect — and it’s not supposed to be.
          It’s honest. It’s raw. It’s curious. It’s a beautiful mess.
        </p>

        {/* Why the Name */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111111] mb-3">
            Why “Beautiful Mess”?
          </h2>
          <p className="text-base leading-relaxed text-gray-700 mb-4">
            Because life isn’t neatly organized. Ideas don’t always arrive in order.
            Creativity doesn’t follow a straight line. And our thoughts are often
            tangled, layered, chaotic — yet meaningful.
          </p>
          <p className="text-base leading-relaxed text-gray-700">
            This blog embraces that honesty. It’s a place where structured knowledge
            meets unfiltered human experience.
          </p>
        </section>

        {/* What You'll Find */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111111] mb-4">
            What You’ll Find Here
          </h2>

          <ul className="space-y-4">

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#347970]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Tech & Coding:</strong> guides, insights, breakdowns, and experiments.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#E8B95E]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Life & Reflections:</strong> thoughts on growth, clarity, and chaos.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#D3756F]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Experiences:</strong> real moments, lessons, and stories worth sharing.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#4A4A4A]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Creative Thoughts:</strong> ideas that don’t fit a category but matter.
              </p>
            </li>

          </ul>
        </section>

        {/* Closing */}
        <p className="text-base leading-relaxed text-gray-700 mb-10">
          Whether you're here to learn, explore a fresh perspective, or simply read something real — welcome. 
          You’re in the right place.
        </p>

        {/* Button */}
        <Link
          href="/blogs"
          className="inline-block px-5 py-3 border rounded-full border-[#1A1A1A] hover:bg-gray-50 transition text-sm"
        >
          Start Reading
        </Link>

      </div>
    </div>
  );
}
