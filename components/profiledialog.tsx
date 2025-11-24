// /components/ProfileDialog.tsx
"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function ProfileDialog() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    // 🔥 Hide the entire component if the user is NOT logged in
    if (!session) return null;

    const role = session.user.role || "guest";
    const name = session.user.name || "User";

    const title =
        role === "director"
            ? "Welcome Director"
            : role === "employee"
                ? "Welcome Employee"
                : "Welcome Guest";

    const subtitle =
        role === "director"
            ? "CEO / Director"
            : role === "employee"
                ? "Staff Member"
                : "Visitor";

    async function handleLogout() {
        await signOut({ callbackUrl: `${window.location.origin}/login` });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger (small profile image) */}
            <DialogTrigger asChild>
                <button
                    className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-700 hover:ring-2 hover:ring-gray-500 transition"
                    aria-label="Open profile dialog"
                >
                    <img
                        src="/logo.png"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
            </DialogTrigger>

            {/* Dialog content */}
            <DialogContent
                className="sm:max-w-md w-[90%] bg-gray-900 text-white rounded-xl p-6"
                aria-describedby="profile-dialog-description"
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        {title}
                    </DialogTitle>
                    <DialogDescription
                        id="profile-dialog-description"
                        className="text-center text-gray-400"
                    >
                        View and manage your profile information.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    {/* Large Profile Image inside Dialog */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                        <img
                            src="/logo.png"
                            alt="Profile Picture"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <p className="text-gray-400 text-sm">{subtitle}</p>
                    <p className="text-gray-300 text-sm">{name}</p>
                </div>

                <DialogFooter>
                    <div className="w-full flex justify-center gap-3">
                        <Button
                            variant="secondary"
                            className="w-28"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            className="w-28"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
