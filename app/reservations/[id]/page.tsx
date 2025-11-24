// /app/reservations/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


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
};

export default function ReservationDetailPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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

            // 🔥 Refresh SWR list immediately
            mutate("/api/reservations");

            toast.success(
                status === "confirmed"
                    ? "Reservation approved 🎉"
                    : status === "cancelled"
                        ? "Reservation cancelled ❌"
                        : "Reservation completed ✨"
            );
        } catch (err) {
            console.error("Error updating reservation:", err);
            toast.error("Something went wrong while updating reservation.");
        } finally {
            setUpdating(false);
        }
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-green-600 text-white">Confirmed</Badge>;
            case "cancelled":
                return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
            case "completed":
                return <Badge className="bg-blue-600 text-white">Completed</Badge>;
            default:
                return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="p-6">
                <Card className="shadow-lg">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">Reservation not found.</p>
                        <Button
                            variant="secondary"
                            className="mt-4"
                            onClick={() => router.push("/reservations")}
                        >
                            Back to List
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const disableApprovalButtons =
        updating ||
        ["confirmed", "cancelled", "completed"].includes(
            reservation.reservationStatus
        );

    return (
        <div className="p-6">
            <Card className="bg-gray-900">
                <CardContent className="p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-50">
                        Reservation Details
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-100">Name</p>
                            <p className="font-medium text-gray-300">{reservation.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-100">Email</p>
                            <p className="font-medium text-gray-300">{reservation.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-100">Phone</p>
                            <p className="font-medium text-gray-300">{reservation.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-100">Date & Time</p>
                            <p className="font-medium text-gray-300">
                                {reservation.date} @ {reservation.time}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-100">Guests</p>
                            <p className="font-medium text-gray-300">{reservation.guests}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-100">Status</p>
                            {getStatusBadge(reservation.reservationStatus)}
                        </div>
                    </div>


                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={disableApprovalButtons}
                            onClick={() => updateStatus("confirmed")}
                        >
                            {updating && (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            )}
                            Approve
                        </Button>

                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            disabled={disableApprovalButtons}
                            onClick={() => updateStatus("cancelled")}
                        >
                            {updating && (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            )}
                            Reject
                        </Button>

                        <Button
                            className="bg-blue-700 hover:bg-blue-800"
                            disabled={
                                updating ||
                                reservation.reservationStatus !== "confirmed"
                            }
                            onClick={() => updateStatus("completed")}
                        >
                            {updating && (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            )}
                            Mark Completed
                        </Button>

                        <Button
                            variant="default"
                            className="bg-gray-800 text-gray-50 font-bold"
                            onClick={() => router.push("/reservations")}
                        >
                            Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
