
import { DocsNav } from "@/components/markdown";
import Link from "next/link";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/80 sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          {/* Left: DocsNav */}
          <div className="flex-1">
            <DocsNav />
          </div>
          {/* Right: Dashboard link */}
          <div className="flex-none">
            <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-sm font-medium border border-transparent transition-colors">
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Main content and aside will be handled in page components */}
        {children}
      </main>
    </div>
  );
}