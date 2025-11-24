// /app/staff/invite/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Role {
    key: string;
    label: string;
}

interface Status {
    key: string;
    label: string;
}

interface StaffForm {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    image: string;
    customRole?: string; // ✅ Added optional field
}

export default function InviteStaffPage() {
    const router = useRouter();

    const [form, setForm] = useState<StaffForm>({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "",
        image: "",
        customRole: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [metaLoading, setMetaLoading] = useState(true);

    // 🔹 Fetch roles + statuses from /api/staff/meta
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch("/api/staff/meta");
                if (!res.ok) throw new Error("Failed to load metadata");

                const data = await res.json();
                setRoles(data.roles || []);
                setStatuses(data.statuses || []);

                // Set sensible defaults
                setForm((prev) => ({
                    ...prev,
                    role: data.roles?.[0]?.key || "",
                    status: data.statuses?.[0]?.key || "",
                }));
            } catch (err) {
                console.error(err);
                setError("Failed to load form metadata");
            } finally {
                setMetaLoading(false);
            }
        };

        fetchMeta();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 🧠 Use custom role if "other" is selected
            const payload = {
                ...form,
                role:
                    form.role === "other"
                        ? form.customRole?.trim() || "other"
                        : form.role,
            };

            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to invite staff");

            router.push("/staff");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (metaLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                <p>Loading form...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
            <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Invite New Staff</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        />
                    </div>

                    {/* 🧩 Role */}
                    <div>
                        <label className="block text-sm mb-1">Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        >
                            {roles
                                // Filter out duplicate "other" role if it already exists in the API data
                                .filter((r) => r.key.toLowerCase() !== "other")
                                .map((r) => (
                                    <option key={r.key} value={r.key}>
                                        {r.label}
                                    </option>
                                ))}
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* ✅ Custom Role Input */}
                    {form.role === "other" && (
                        <div className="mt-3">
                            <label className="block text-sm mb-1">Specify Other Role</label>
                            <input
                                type="text"
                                name="customRole"
                                placeholder="e.g., Bartender, Accountant"
                                value={form.customRole || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className="block text-sm mb-1">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        >
                            {statuses.map((s) => (
                                <option key={s.key} value={s.key}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm mb-1">Profile Image</label>
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
                                    setForm((prev) => ({ ...prev, image: data.secure_url }));
                                }
                            }}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
                        />
                        {form.image && (
                            <img
                                src={form.image}
                                alt="Preview"
                                className="mt-2 w-24 h-24 object-cover rounded-full border border-gray-700"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !form.name.trim() ||
                            !form.email.trim() ||
                            !form.phone.trim() ||
                            !form.role.trim() ||
                            (form.role === "other" && !form.customRole?.trim()) ||
                            !form.status.trim() ||
                            !form.image.trim()
                        }
                        className={`w-full px-4 py-2 rounded-md font-semibold transition ${loading ||
                            !form.name.trim() ||
                            !form.email.trim() ||
                            !form.phone.trim() ||
                            !form.role.trim() ||
                            (form.role === "other" && !form.customRole?.trim()) ||
                            !form.status.trim() ||
                            !form.image.trim()
                            ? "bg-gray-700 cursor-not-allowed opacity-50"
                            : "bg-indigo-600 hover:bg-indigo-500"
                            }`}
                    >
                        {loading ? "Inviting..." : "Invite Staff"}
                    </button>

                </form>
            </div>
        </div>
    );
}
