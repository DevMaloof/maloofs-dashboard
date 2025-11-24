"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    role: string;
    image: string;
    customRole?: string; // ✅ Added for "Other"
}

interface Role {
    key: string;
    label: string;
}

interface Status {
    key: string;
    label: string;
}

export default function StaffDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const router = useRouter();

    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch staff details + enums
    useEffect(() => {
        async function fetchData() {
            try {
                const [staffRes, metaRes] = await Promise.all([
                    fetch(`/api/staff/${id}`),
                    fetch(`/api/staff/meta`),
                ]);

                if (!staffRes.ok) throw new Error("Failed to fetch staff");
                if (!metaRes.ok) throw new Error("Failed to fetch staff metadata");

                const staffData = await staffRes.json();
                const metaData = await metaRes.json();

                setStaff(staffData);
                setRoles(metaData.roles);
                setStatuses(metaData.statuses);
            } catch (err) {
                console.error(err);
                toast.error("Error loading staff details");
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchData();
    }, [id]);

    // ✅ Handle Update
    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!staff) return;

        try {
            const payload = {
                ...staff,
                role:
                    staff.role === "other"
                        ? staff.customRole?.trim() || "other"
                        : staff.role,
            };

            const res = await fetch(`/api/staff/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update staff");

            toast.success("Staff updated successfully ✅");

            setTimeout(() => {
                router.push("/staff");
            }, 800);
        } catch (err) {
            console.error(err);
            toast.error("Error updating staff ❌");
        }
    }

    // ✅ Handle Delete
    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this staff member?")) return;

        try {
            const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });

            if (!res.ok) throw new Error("Failed to delete staff");

            toast.success("Staff deleted successfully 🗑️");
            router.push("/staff");
        } catch (err) {
            console.error(err);
            toast.error("Error deleting staff ❌");
        }
    }

    if (loading) return <p className="text-center py-10">Loading...</p>;
    if (!staff) return <p className="text-center py-10">Staff not found.</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-lg mx-auto shadow-lg bg-gray-900 border-0">
                <CardContent>
                    <h1 className="text-gray-50 text-2xl font-bold mb-6 text-center">
                        Staff Details
                    </h1>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        {/* Name */}
                        <div>
                            <Label className="text-gray-50">Name</Label>
                            <Input
                                value={staff.name}
                                className="text-gray-100"
                                onChange={(e) => setStaff({ ...staff, name: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Label className="text-gray-50">Email</Label>
                            <Input
                                type="email"
                                value={staff.email}
                                className="text-gray-100"
                                onChange={(e) => setStaff({ ...staff, email: e.target.value })}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <Label className="text-gray-50">Phone</Label>
                            <Input
                                value={staff.phone}
                                className="text-gray-100"
                                onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                            />
                        </div>

                        {/* Profile Image */}
                        <div className="flex flex-col items-center mt-4">
                            <Label className="text-gray-50 mb-2">Profile Image</Label>
                            {staff.image && (
                                <img
                                    src={staff.image}
                                    alt={staff.name}
                                    className="w-24 h-24 rounded-full border border-gray-700 mb-3"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append("file", file);

                                    const res = await fetch("/api/staff/upload", {
                                        method: "POST",
                                        body: formData,
                                    });

                                    const data = await res.json();
                                    if (data.secure_url) {
                                        setStaff({ ...staff, image: data.secure_url });
                                    }
                                }}
                                className="text-gray-100 bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
                            />
                        </div>

                        {/* Status (centered) */}
                        <div className="flex flex-col items-center">
                            <Label className="text-gray-50 mb-2">Status</Label>
                            <Select
                                value={staff.status}
                                onValueChange={(value) => setStaff({ ...staff, status: value })}
                            >
                                <SelectTrigger className="bg-gray-800 border-0 text-gray-100 w-full sm:w-64">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.key} value={s.key}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role (centered) */}
                        <div className="flex flex-col items-center">
                            <Label className="text-gray-50 mb-2">Role</Label>
                            <Select
                                value={staff.role}
                                onValueChange={(value) => setStaff({ ...staff, role: value })}
                            >
                                <SelectTrigger className="bg-gray-800 border-0 text-gray-100 w-full sm:w-64">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles
                                        .filter((r) => r.key.toLowerCase() !== "other")
                                        .map((r) => (
                                            <SelectItem key={r.key} value={r.key}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* ✅ Custom Role Input (shows if “Other” is selected) */}
                            {staff.role === "other" && (
                                <div className="mt-3 w-full sm:w-64">
                                    <Label className="text-gray-50 mb-1">Specify Other Role</Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Bartender, Accountant"
                                        value={staff.customRole || ""}
                                        onChange={(e) =>
                                            setStaff({ ...staff, customRole: e.target.value })
                                        }
                                        className="bg-gray-800 border border-gray-700 text-gray-100"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                            <Button type="submit" className="bg-gray-800 w-full sm:w-auto">
                                Update
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                            >
                                Delete
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
