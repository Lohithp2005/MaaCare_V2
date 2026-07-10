import Navbar from "@/app/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="h-screen flex items-center justify-center ">{children}</main>
    </>
  );
}