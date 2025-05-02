import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-sky-100 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
          OpticApp Management
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
          Streamline your optical shop operations with our intuitive SaaS solution. Manage inventory, customers, prescriptions, and appointments effortlessly.
        </p>
        <div className="mt-10 flex justify-center gap-x-6">
          <Link href="/login" passHref>
            <Button size="lg">
              Login to Your Account
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button size="lg" variant="outline">
              Get Started <span aria-hidden="true">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
