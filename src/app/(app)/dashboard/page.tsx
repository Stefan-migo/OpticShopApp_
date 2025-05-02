// This page will now render inside the AppLayout at /dashboard
export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold">Optic SaaS Dashboard</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Welcome to your optical shop management system.
      </p>
      {/* Add actual dashboard components here later */}
    </main>
  );
}
