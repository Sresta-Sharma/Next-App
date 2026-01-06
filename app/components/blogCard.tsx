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
      href={`/blogs/${blog.blog_id}`}
      className="group block py-5 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:translate-x-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors leading-snug">
            {blog.title}
          </h2>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{blog.author_name}</span>
            <span>·</span>
            <span>{new Date(blog.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>
        
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-all duration-200 group-hover:translate-x-1 flex-shrink-0 mt-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
