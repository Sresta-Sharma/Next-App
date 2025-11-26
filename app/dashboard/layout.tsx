import UserNavbar from "../components/nav/userNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </>
  );
}
