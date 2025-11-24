"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import ProfileDialog from "./profiledialog";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar (now controlled everywhere) */}
            <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
                    {/* Left side: menu button + title */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-white hover:bg-gray-800 transition"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <h1 className="ml-4 text-lg font-semibold text-white">Maloof Dashboard</h1>
                    </div>

                    {/* Right side: ProfileDialog trigger */}
                    <ProfileDialog />
                </header>

                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
