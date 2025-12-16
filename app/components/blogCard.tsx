import Link from "next/link";

interface Blog {
  blog_id: number;
  title: string;
  created_at: string;
  author_name: string;
}

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blog/${blog.blog_id}`}
      className="block border-b pb-6 mb-6 hover:bg-gray-50 transition rounded-xl p-4"
    >
      <h2 className="text-2xl font-semibold text-black mb-2">
        {blog.title}
      </h2>

      <p className="text-sm text-gray-500">
        {new Date(blog.created_at).toDateString()}
      </p>
    </Link>
  );
}
