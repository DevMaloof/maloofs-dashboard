// /app/staff/invite/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    UserPlus, Mail, Phone, Shield, Camera, Upload,
    ArrowLeft, Loader2, AlertCircle, CheckCircle, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    customRole?: string;
}

export default function InviteStaffPage() {
    const router = useRouter();

    const [form, setForm] = useState<StaffForm>({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "active",
        image: "",
        customRole: "",
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [metaLoading, setMetaLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch("/api/staff/meta");
                if (!res.ok) throw new Error("Failed to load metadata");

                const data = await res.json();
                setRoles(data.roles || []);
                setStatuses(data.statuses || []);

                setForm((prev) => ({
                    ...prev,
                    role: data.roles?.[0]?.key || "",
                    status: data.statuses?.find((s: Status) => s.key === "active")?.key || "active",
                }));
            } catch (err) {
                console.error(err);
                toast.error("Failed to load form metadata");
            } finally {
                setMetaLoading(false);
            }
        };

        fetchMeta();
    }, []);

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/staff/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setForm(prev => ({ ...prev, image: data.secure_url || data.url }));
            toast.success("Image uploaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...form,
                role: form.role === "other" ? (form.customRole?.trim() || "other") : form.role,
            };

            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to invite staff");
            }

            toast.success(
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Staff member invited successfully!</span>
                </div>
            );

            setTimeout(() => {
                router.push("/staff");
                router.refresh();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
            toast.error(err.message || "Failed to invite staff");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (metaLoading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-400">Loading form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">Invite New Staff</h1>
                            <p className="text-gray-400 text-sm">Add a new member to your restaurant team</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-gray-800 bg-gray-900/50">
                    <CardHeader className="pb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                                <UserPlus className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-gray-300 font-bold">New Team Member</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Fill in the details below to invite a new staff member
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                                <TabsTrigger value="details" className="text-gray-300 data-[state=active]:bg-blue-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="role" className="text-gray-300 data-[state=active]:bg-purple-600">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Role & Status
                                </TabsTrigger>
                                <TabsTrigger value="photo" className="text-gray-300 data-[state=active]:bg-emerald-600">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Photo
                                </TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit}>
                                <TabsContent value="details" className="space-y-6 mt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-300 flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="bg-gray-800 border-gray-700 text-white h-12"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="john@maloofs.com"
                                                className="bg-gray-800 border-gray-700 text-white h-12"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="(555) 123-4567"
                                                className="bg-gray-800 border-gray-700 text-white h-12"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="role" className="space-y-6 mt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-gray-300 flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Role *
                                            </Label>
                                            <Select
                                                value={form.role}
                                                onValueChange={(value) => setForm({ ...form, role: value })}
                                            >
                                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700">
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

                                            {form.role === "other" && (
                                                <div className="mt-3">
                                                    <Input
                                                        name="customRole"
                                                        placeholder="Specify role (e.g., Bartender, Accountant)"
                                                        value={form.customRole || ""}
                                                        onChange={(e) => setForm({ ...form, customRole: e.target.value })}
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-gray-300">Status *</Label>
                                            <Select
                                                value={form.status}
                                                onValueChange={(value) => setForm({ ...form, status: value })}
                                            >
                                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700">
                                                    {statuses.map((s) => (
                                                        <SelectItem key={s.key} value={s.key}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${s.key === 'active' ? 'bg-emerald-500' :
                                                                    s.key === 'pending' ? 'bg-amber-500' :
                                                                        'bg-gray-500'
                                                                    }`} />
                                                                {s.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="photo" className="space-y-6 mt-6">
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50">
                                        {form.image ? (
                                            <div className="text-center">
                                                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-gray-700">
                                                    <AvatarImage src={form.image} />
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-2xl">
                                                        {getInitials(form.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-gray-300 mb-4">Profile photo uploaded</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setForm({ ...form, image: "" })}
                                                    className="border-gray-700 text-gray-400 hover:text-white"
                                                >
                                                    Remove Photo
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <Camera className="h-10 w-10 text-gray-500" />
                                                </div>
                                                <p className="text-gray-400 mb-2">Upload profile photo</p>
                                                <p className="text-sm text-gray-500 mb-4">Recommended: Square image, max 5MB</p>
                                                <Input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(file);
                                                    }}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                    disabled={uploading}
                                                    className="border-gray-700 text-gray-400 hover:text-white"
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            Choose File
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {error && (
                                    <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <span>{error}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => router.push("/staff")}
                                            className="border-0 bg-gray-700/50 text-gray-100 hover:text-white hover:bg-gray-800"
                                        >
                                            Cancel
                                        </Button>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    const tabs = ["details", "role", "photo"];
                                                    const currentIndex = tabs.indexOf(activeTab);
                                                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                                                }}
                                                disabled={activeTab === "details"}
                                                className="border-0 bg-gray-700/50 text-gray-100 hover:text-white hover:bg-gray-800"
                                            >
                                                Previous
                                            </Button>
                                            {activeTab !== "photo" ? (
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        const tabs = ["details", "role", "photo"];
                                                        const currentIndex = tabs.indexOf(activeTab);
                                                        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                                                    }}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                >
                                                    Next
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={loading || !form.name || !form.email || !form.role || !form.status}
                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Inviting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="h-4 w-4 mr-2" />
                                                            Invite Staff Member
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}