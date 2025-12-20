// /components/ui/app-sidebar.tsx
"use client";

import Link from "next/link";
import {
    Home,
    ScrollText,
    Mail,
    Pizza,
    User,
    X,
    NotebookText,
    NotebookPen,
    Settings,
    LogOut,
    Users,
    ChevronRight,
    UtensilsCrossed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
    open?: boolean;
    onClose?: () => void;
};

export function AppSidebar({ open = false, onClose }: Props) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const role = session?.user?.role || "employee";

    const mainItems = [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Reservations", url: "/reservations", icon: ScrollText },
        { title: "Subscriptions", url: "/subscriptions", icon: Users },
        { title: "Offers", url: "/offers", icon: Mail },
        { title: "Menu Management", url: "/menumanagement", icon: Pizza },
    ];

    const contentItems = [
        { title: "Reviews", url: "/reviews", icon: NotebookText },
        { title: "Review Form", url: "/review", icon: NotebookPen },
    ];

    const adminItems = [
        { title: "Staff Management", url: "/staff", icon: User },
        { title: "Settings", url: "/settings", icon: Settings },
    ];

    const getActiveClass = (url: string) => {
        if (url === "/" && pathname === "/") return true;
        if (url !== "/" && pathname.startsWith(url)) return true;
        return false;
    };


    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="relative z-50 flex flex-col h-full w-72 bg-gray-900 border-r border-gray-800 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <UtensilsCrossed className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-white">Maloof's</h1>
                                        <p className="text-xs text-gray-400">Restaurant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-800 transition"
                                    aria-label="Close sidebar"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="p-3 rounded-lg bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">
                                            {session?.user?.name?.charAt(0) || "U"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {session?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {role === "director" ? "Director" : "Staff"}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-4 px-3">
                            {/* Main Navigation */}
                            <div className="space-y-1 mb-6">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Main Navigation
                                </p>
                                {mainItems.map((item) => {
                                    const isActive = getActiveClass(item.url);
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.url}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.title}</span>
                                            {isActive && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Content Management */}
                            <div className="space-y-1 mb-6">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Content
                                </p>
                                {contentItems.map((item) => {
                                    const isActive = getActiveClass(item.url);
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.url}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Admin Navigation (only for directors) */}
                            {role === "director" && (
                                <div className="space-y-1 mb-6">
                                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Administration
                                    </p>
                                    {adminItems.map((item) => {
                                        const isActive = getActiveClass(item.url);
                                        return (
                                            <Link
                                                key={item.title}
                                                href={item.url}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                                    ? "bg-gray-800 text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-800">
                            
                            <div className="mt-4 px-3 text-xs text-gray-500 text-center">
                                © {new Date().getFullYear()} Maloof's Restaurant
                                <br />
                                <span className="text-[10px] mt-1 inline-block">v2.0</span>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}