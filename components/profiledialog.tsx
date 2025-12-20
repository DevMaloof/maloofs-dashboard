// /components/ProfileDialog.tsx
"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
    LogOut,
    User,
    Shield,
    Mail,
    Crown,
    Briefcase,
    UtensilsCrossed
} from "lucide-react";

export default function ProfileDialog() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    if (!session) return null;

    const role = session.user.role || "guest";
    const name = session.user.name || "User";
    const email = session.user.email || "user@example.com";

    const getRoleDetails = () => {
        switch (role) {
            case "director":
                return {
                    title: "Director",
                    subtitle: "Full System Access",
                    icon: <Crown className="w-5 h-5 text-amber-400" />,
                    color: "from-amber-500/20 to-amber-600/10",
                    border: "border-amber-500/30",
                    badgeColor: "bg-gradient-to-r from-amber-500 to-amber-600",
                    bgColor: "bg-amber-500/10"
                };
            case "employee":
                return {
                    title: "Staff",
                    subtitle: "Limited Access",
                    icon: <Briefcase className="w-5 h-5 text-blue-400" />,
                    color: "from-blue-500/20 to-blue-600/10",
                    border: "border-blue-500/30",
                    badgeColor: "bg-gradient-to-r from-blue-500 to-blue-600",
                    bgColor: "bg-blue-500/10"
                };
            default:
                return {
                    title: "Guest",
                    subtitle: "Restricted Access",
                    icon: <User className="w-5 h-5 text-gray-400" />,
                    color: "from-gray-500/20 to-gray-600/10",
                    border: "border-gray-500/30",
                    badgeColor: "bg-gradient-to-r from-gray-500 to-gray-600",
                    bgColor: "bg-gray-500/10"
                };
        }
    };

    const roleDetails = getRoleDetails();

    async function handleLogout() {
        await signOut({ callbackUrl: `${window.location.origin}/login` });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger Button - Minimal */}
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-white">{name}</p>
                        <p className="text-xs text-gray-400">{roleDetails.title}</p>
                    </div>
                </button>
            </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="sm:max-w-md w-[95%] bg-gray-900 border border-gray-800 rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gray-900">
                    <DialogHeader className="space-y-3">
                        <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                                <UtensilsCrossed className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-2xl font-bold text-white">
                                {name}
                            </DialogTitle>
                            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${roleDetails.border} ${roleDetails.bgColor}`}>
                                {roleDetails.icon}
                                <span className="text-sm font-medium text-white">{roleDetails.title}</span>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Profile Content */}
                <div className="p-6 space-y-5">
                    {/* User Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="font-medium text-white truncate">{email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Access Level</p>
                                <p className="font-medium text-white">{roleDetails.subtitle}</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2">
                        <Button
                            variant="destructive"
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-3"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}