// /app/reservations/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar, Clock, Users, Mail, Phone, MapPin,
    CheckCircle, XCircle, CheckCheck, ArrowLeft,
    Loader2, MessageSquare, User, Printer, Copy,
    AlertCircle, MoreVertical, Edit
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Reservation = {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    reservationStatus: "pending" | "confirmed" | "cancelled" | "completed";
    notes?: string | null;
    specialRequests?: string;
    tablePreference?: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function ReservationDetailPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchReservation = async () => {
            try {
                const res = await fetch(`/api/reservations/${id}`);
                if (!res.ok) throw new Error("Failed to fetch reservation");
                const data: Reservation = await res.json();
                setReservation(data);
            } catch (err) {
                console.error("Error fetching reservation:", err);
                setReservation(null);
                toast.error("Failed to load reservation details");
            } finally {
                setLoading(false);
            }
        };

        fetchReservation();
    }, [id]);

    const updateStatus = async (
        status: "confirmed" | "cancelled" | "completed"
    ) => {
        if (!id) return;
        setActiveAction(status);
        setUpdating(true);

        try {
            const res = await fetch(`/api/reservations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reservationStatus: status }),
            });

            if (!res.ok) throw new Error("Failed to update reservation");

            const updated: Reservation = await res.json();
            setReservation(updated);

            // Refresh SWR list immediately
            mutate("/api/reservations");

            const messages = {
                confirmed: "Reservation confirmed successfully! ✅",
                cancelled: "Reservation cancelled successfully ❌",
                completed: "Reservation marked as completed ✨"
            };

            toast.success(messages[status], {
                duration: 3000,
            });
        } catch (err) {
            console.error("Error updating reservation:", err);
            toast.error("Something went wrong while updating reservation.");
        } finally {
            setUpdating(false);
            setActiveAction(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            confirmed: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0",
            cancelled: "bg-gradient-to-r from-red-600 to-rose-600 text-white border-0",
            completed: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0",
            pending: "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0"
        };

        const labels = {
            confirmed: "Confirmed",
            cancelled: "Cancelled",
            completed: "Completed",
            pending: "Pending"
        };

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
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

    const handleSendConfirmation = async () => {
        if (!reservation) return;

        try {
            const res = await fetch(`/api/reservations/${id}/send-confirmation`, {
                method: "POST",
            });

            if (res.ok) {
                toast.success("Confirmation email sent successfully!");
            } else {
                toast.error("Failed to send confirmation email");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending confirmation");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-400">Loading reservation details...</p>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-xl font-bold text-white mb-2">Reservation Not Found</h2>
                    <p className="text-gray-400 mb-4">The reservation you're looking for doesn't exist.</p>
                    <Button
                        onClick={() => router.push("/reservations")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                        Back to Reservations
                    </Button>
                </div>
            </div>
        );
    }

    const disableApprovalButtons =
        updating ||
        ["confirmed", "cancelled", "completed"].includes(
            reservation.reservationStatus
        );

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/reservations")}
                                className="text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Reservation Details</h1>
                                <p className="text-gray-400 text-sm">Manage and update reservation information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.reservationStatus)}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem onClick={handleSendConfirmation}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Confirmation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.print()}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(reservation.id)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem
                                        onClick={() => window.location.href = `mailto:${reservation.email}`}
                                        className="text-blue-400"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Contact Guest
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Guest Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-gray-800 bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Guest Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center text-center mb-6">
                                    <Avatar className="h-20 w-20 mb-4 border-2 border-gray-700">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-xl">
                                            {getInitials(reservation.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold text-white">{reservation.name}</h2>
                                    <p className="text-gray-400 text-sm">Reservation #{reservation.id.slice(-8)}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400">Email</p>
                                            <p className="text-white truncate">{reservation.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400">Phone</p>
                                            <p className="text-white">{reservation.phone}</p>
                                        </div>
                                    </div>

                                    {reservation.createdAt && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-400">Created</p>
                                                <p className="text-white text-sm">
                                                    {new Date(reservation.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Requests */}
                        {reservation.specialRequests && (
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-400" />
                                        Special Requests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-gray-300 italic">"{reservation.specialRequests}"</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Reservation Details & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-800 bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Reservation Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                <Calendar className="h-5 w-5" />
                                                <span className="text-sm font-medium">Date & Time</span>
                                            </div>
                                            <div className="p-4 rounded-lg bg-gray-800/50">
                                                <p className="text-xl font-bold text-white">{formatDate(reservation.date)}</p>
                                                <p className="text-lg text-amber-400">{reservation.time}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                <Users className="h-5 w-5" />
                                                <span className="text-sm font-medium">Party Size</span>
                                            </div>
                                            <div className="p-4 rounded-lg bg-gray-800/50">
                                                <p className="text-3xl font-bold text-white">{reservation.guests}</p>
                                                <p className="text-sm text-gray-400">people</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {reservation.tablePreference && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                    <MapPin className="h-5 w-5" />
                                                    <span className="text-sm font-medium">Table Preference</span>
                                                </div>
                                                <div className="p-4 rounded-lg bg-gray-800/50">
                                                    <p className="text-lg font-semibold text-white">
                                                        {reservation.tablePreference}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                <Clock className="h-5 w-5" />
                                                <span className="text-sm font-medium">Duration</span>
                                            </div>
                                            <div className="p-4 rounded-lg bg-gray-800/50">
                                                <p className="text-lg font-semibold text-white">2 hours</p>
                                                <p className="text-sm text-gray-400">Standard seating duration</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {reservation.notes && (
                                    <div className="mt-6 pt-6 border-t border-gray-800">
                                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                                            <Edit className="h-5 w-5" />
                                            <span className="text-sm font-medium">Internal Notes</span>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-800/50">
                                            <p className="text-gray-300">{reservation.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Panel */}
                        <Card className="border-gray-800 bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Reservation Actions</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Update the status of this reservation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Button
                                        size="lg"
                                        disabled={disableApprovalButtons}
                                        onClick={() => updateStatus("confirmed")}
                                        className={`h-20 flex-col gap-2 ${reservation.reservationStatus === 'confirmed'
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                                : 'bg-gray-800 hover:bg-gray-700'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {activeAction === 'confirmed' ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-6 w-6" />
                                        )}
                                        <span className="text-sm">
                                            {reservation.reservationStatus === 'confirmed' ? 'Confirmed' : 'Confirm'}
                                        </span>
                                    </Button>

                                    <Button
                                        size="lg"
                                        disabled={disableApprovalButtons}
                                        onClick={() => updateStatus("cancelled")}
                                        className={`h-20 flex-col gap-2 ${reservation.reservationStatus === 'cancelled'
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600'
                                                : 'bg-gray-800 hover:bg-gray-700'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {activeAction === 'cancelled' ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <XCircle className="h-6 w-6" />
                                        )}
                                        <span className="text-sm">
                                            {reservation.reservationStatus === 'cancelled' ? 'Cancelled' : 'Cancel'}
                                        </span>
                                    </Button>

                                    <Button
                                        size="lg"
                                        disabled={updating || reservation.reservationStatus !== "confirmed"}
                                        onClick={() => updateStatus("completed")}
                                        className={`h-20 flex-col gap-2 ${reservation.reservationStatus === 'completed'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                                                : 'bg-gray-800 hover:bg-gray-700'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {activeAction === 'completed' ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <CheckCheck className="h-6 w-6" />
                                        )}
                                        <span className="text-sm">
                                            {reservation.reservationStatus === 'completed' ? 'Completed' : 'Complete'}
                                        </span>
                                    </Button>
                                </div>

                                <Separator className="my-6 bg-gray-800" />

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.href = `mailto:${reservation.email}`}
                                        className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email Guest
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.href = `tel:${reservation.phone}`}
                                        className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Guest
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSendConfirmation}
                                        className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Send Confirmation
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-800 pt-6">
                                <p className="text-sm text-gray-500">
                                    Last updated: {reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}