// pages/pi.tsx
"use client";

import Sidebar from "../src/ui/navigation/sidebar";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PiPage() {
  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">PI Dashboard</h1>
          </header>

          <main className="flex-1 p-4 space-y-4">
            {/* Add your PI-specific content here */}
            <section className="grid md:grid-cols-2 gap-4">
              {/* Example Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Welcome, PI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Here is your PI Dashboard.</p>
                </CardContent>
              </Card>

              {/* Additional content */}
            </section>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
