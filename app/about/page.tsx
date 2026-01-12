import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#111111] mb-6">
          About Vichar Kendra
        </h1>

        {/* Intro */}
        <p className="text-base leading-relaxed text-gray-700 mb-6">
          Vichar Kendra is a digital space dedicated to thoughts, ideas, and
          meaningful expression. It is a place where technology, learning,
          personal growth, and everyday experiences come together in the form
          of words.
        </p>

        <p className="text-base leading-relaxed text-gray-700 mb-10">
          Some writings here are technical. Some are reflective. Some are simply
          honest thoughts that needed a voice. This platform is built to share,
          connect, and communicate ideas in their purest form — thoughtful,
          curious, and real.
        </p>

        {/* Why the Name */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111111] mb-3">
            Why “Vichar Kendra”?
          </h2>
          <p className="text-base leading-relaxed text-gray-700 mb-4">
            “Vichar” means thought, and “Kendra” means center. Together,
            Vichar Kendra represents a central space for ideas, perspectives,
            and voices to meet.
          </p>
          <p className="text-base leading-relaxed text-gray-700">
            It is a platform where structured knowledge blends with personal
            insight, and where thoughts are shared openly to inspire learning,
            discussion, and growth.
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
                <strong>Technology & Coding:</strong> tutorials, concepts, and practical insights.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#E8B95E]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Learning & Growth:</strong> academic, career, and self-development journeys.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#D3756F]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Experiences:</strong> real stories, challenges, and lessons from everyday life.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#4A4A4A]"></span>
              <p className="text-base leading-relaxed text-gray-700">
                <strong>Thoughts & Reflections:</strong> ideas that provoke thinking and discussion.
              </p>
            </li>

          </ul>
        </section>

        {/* Closing */}
        <p className="text-base leading-relaxed text-gray-700 mb-10">
          Whether you are here to learn something new, explore different
          perspectives, or simply read thoughtful content, Vichar Kendra
          welcomes you to the center of ideas.
        </p>

        {/* Button */}
        <Link
          href="/blogs"
          className="inline-block px-5 py-3 border rounded-full border-[#1A1A1A] hover:bg-gray-50 transition text-sm"
        >
          Explore Writings
        </Link>

      </div>
    </div>
  );
}
