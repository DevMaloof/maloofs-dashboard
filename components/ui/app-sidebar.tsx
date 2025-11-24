"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Home,
    ScrollText,
    Mail,
    Pizza,
    User,
    X,
    NotebookText,
    NotebookPen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type Props = {
    open?: boolean;
    onClose?: () => void;
};

export function AppSidebar({ open = false, onClose }: Props) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const role = session?.user?.role || "employee";
    const items = [
        { title: "Home", url: "/", icon: Home },
        { title: "Reservations", url: "/reservations", icon: ScrollText },
        { title: "Subscriptions", url: "/subscriptions", icon: ScrollText },
        { title: "Offers", url: "/offers", icon: Mail },
        { title: "Menu Management", url: "/menumanagement", icon: Pizza },
        { title: "Staff", url: "/staff", icon: User, directorOnly: true },
        { title: "Reviews", url: "/reviews", icon: NotebookText },
        { title: "Review Form", url: "/review", icon: NotebookPen },
    ];

    const visibleItems = items.filter(
        (item) => !item.directorOnly || role === "director"
    );

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50">
                    {/* 🔹 Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* 🔹 Sidebar Drawer */}
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        className="relative z-50 flex flex-col h-full w-72 bg-gray-900 text-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            {/* parent has explicit size & relative so `fill` works reliably */}
                            <div className="relative h-14 w-44">
                                <img
                                    src="/logo.png"
                                    alt="Maloof's Logo"
                                    className="object-contain max-h-full max-w-full"
                                />
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Close sidebar"
                                className="p-2 rounded-md hover:bg-gray-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <nav
                            role="navigation"
                            aria-label="Dashboard Navigation"
                            className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                        >
                            {visibleItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 font-semibold ${pathname === item.url ? "bg-gray-800" : "hover:bg-gray-800"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.title}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="border-t border-gray-800 p-4 text-xs text-gray-400 text-center">
                            © {new Date().getFullYear()} Maloof’s Dashboard
                        </div>
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}
