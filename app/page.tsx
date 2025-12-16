import Link from "next/link";
import BlogCard from "./components/blogCard";
import WriteStoryButton from "./components/writeStoryButton";
import SubscribeBox from "./components/subscribeBox";

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blogs`, {
      cache: "force-cache",
    });

    if (!res.ok) return [];

    return res.json();
  } catch (err) {
    console.error("Error fetching blogs:", err);
    return [];
  }
}

export default async function HomePage(){
  
  const blogs = await getBlogs();
  const latest = blogs.slice(0,5); // show only latest 5
  
  return(
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111]">

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Beautiful Mess
        </h1>

        <p className="mt-6 text-2xl text-[#737373] max-w-2xl mx-auto leading-snug">
          A space where ideas, stories, and creativity come together — beautifully
          chaotic.
        </p>

        <p className="mt-4 text-lg text-[#737373] max-w-2xl mx-auto">
          Read stories about technology, self-growth, experiences, and the everyday
          chaos that shapes us. Sometimes technical. Sometimes personal. Always
          real.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/blogs"
            className="px-8 py-3 bg-[#111111] text-white rounded-full hover:opacity-95 transition"
          >
            Start Reading
          </Link>

          < WriteStoryButton />
        </div>
      </section>

      {/* CONTENT WRAPPER */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
        {/* MAIN LEFT */}
        <main className="lg:col-span-2 space-y-14">

         {/* LATEST POSTS FROM BACKEND */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>

            <div className="space-y-8">
              {latest.length > 0 ? (
                latest.map((blog: any) => (
                  <BlogCard key={blog.blog_id} blog={blog} />
                ))
              ) : (
                <p className="text-gray-600">No posts yet.</p>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/blogs"
                className="px-5 py-2 rounded-full border border-[#1A1A1A] inline-block"
              >
                View all posts
              </Link>
            </div>
          </section> 
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-8">
          {/* ABOUT */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">About Beautiful Mess</h3>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Beautiful Mess is a space where ideas collide, evolve, and take shape.
              Here, I write about technology, personal growth, challenges, experiences,
              small victories, and the lessons hidden inside the chaos of everyday life.
            </p>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Some posts are technical. Some are reflective. Some are just thoughts I
              needed to share. This space isn’t perfect — and it’s not supposed to be.
              It’s honest. It’s raw. It’s curious.
            </p>

            <div className="mt-4">
              <Link
                href="/about"
                className="text-sm inline-block px-3 py-2 rounded-full border border-[#1A1A1A]"
              >
                Read more
              </Link>
            </div>
          </section>

          {/* TRENDING TOPICS / CATEGORIES */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Trending Topics</h3>

            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Tech & Coding",
                "Life & Reflections",
                "Productivity",
                "Learning Journey",
                "Creative Thoughts",
                "Career & Growth",
                "Experiences",
                "Mindset",
              ].map((tag) => (
                <Link
                  href={`/tag/${tag.replace(/\s+/g, "-").toLowerCase()}`}
                  key={tag}
                  className="text-sm px-3 py-2 rounded-full bg-[#F3F3F3] hover:bg-[#EDEDED] inline-block"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          {/* SUBSCRIBE CTA */}
          <section className="bg-white p-6 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Subscribe</h4>
            <p className="mt-2 text-sm text-gray-600">
              Get new stories in your inbox.
            </p>

            <SubscribeBox/>
          </section>
        </aside>
      </div>
    </main>
  );
}