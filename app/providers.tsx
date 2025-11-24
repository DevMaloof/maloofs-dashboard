"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import DashboardShell from "@/components/dashboard-shell";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardShell>{children}</DashboardShell>
      <Toaster richColors position="top-right" theme="dark" />
    </SessionProvider>
  );
}
