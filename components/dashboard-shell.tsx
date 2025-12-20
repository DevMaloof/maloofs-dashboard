// /components/dashboard-shell.tsx
"use client";

import React, { useState } from "react";
import { Menu, UtensilsCrossed } from "lucide-react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import ProfileDialog from "./profiledialog";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-950">
            {/* Sidebar */}
            <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation Bar - Clean and Minimal */}
                <header className="sticky top-0 z-40 h-16 px-6 flex items-center justify-between border-b border-gray-800 bg-gray-900/90 backdrop-blur-lg">
                    {/* Left: Menu button + Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-5 h-5 text-gray-300" />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Maloof's</h1>
                                <p className="text-xs text-gray-400">Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Profile */}
                    <div className="flex items-center gap-3">
                        <ProfileDialog />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-auto bg-gray-950">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}