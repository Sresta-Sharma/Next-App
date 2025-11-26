import BlogNavbar from "../components/nav/blogNavbar";

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogNavbar />
      <main>{children}</main>
    </>
  );
}
