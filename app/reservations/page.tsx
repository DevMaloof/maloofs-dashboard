// /app/reservations/page.tsx
"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
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
  notes?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return data.reservations || [];
};

export default function ReservationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const { data: reservations = [], error, isLoading } = useSWR(
    "/api/reservations",
    fetcher,
    { refreshInterval: 5000 }
  );

  const deleteReservation = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this reservation?");
    if (!confirmed) return;

    const res = await fetch(`/api/reservations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      mutate("/api/reservations");
      toast.success("Reservation deleted successfully ✅");
    } else {
      toast.error("Failed to delete reservation ❌");
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


  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  const filteredReservations = reservations
    .filter((res: any) =>
      [res.name, res.email, res.phone].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((res: any) =>
      statusFilter === "all" ? true : res.reservationStatus === statusFilter
    )
    .sort((a: any, b: any) => {
      if (sortBy === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("date-desc");
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg bg-gray-900">
        <CardContent>
          <h1 className="text-2xl font-bold mb-6 text-gray-50">Reservations</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-white placeholder:text-white md:w-1/3"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-white md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-white md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Loading & Error */}
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading reservations...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-6">
              Failed to load reservations.
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-50 font-bold">Name</TableHead>
                    <TableHead className="text-gray-50 font-bold">Email</TableHead>
                    <TableHead className="text-gray-50 font-bold">Phone</TableHead>
                    <TableHead className="text-gray-50 font-bold">Date</TableHead>
                    <TableHead className="text-gray-50 font-bold">Time</TableHead>
                    <TableHead className="text-gray-50 font-bold">Guests</TableHead>
                    <TableHead className="text-gray-50 font-bold">Status</TableHead>
                    <TableHead className="text-gray-50 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((res: any) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium text-white">{res.name}</TableCell>
                      <TableCell className="font-medium text-white">{res.email}</TableCell>
                      <TableCell className="font-medium text-white">{res.phone}</TableCell>
                      <TableCell className="font-medium text-white">
                        {formatDate(res.date)}
                      </TableCell>
                      <TableCell className="font-medium text-white">{res.time}</TableCell>
                      <TableCell className="font-medium text-white">{res.guests}</TableCell>
                      <TableCell className="font-medium text-white">
                        {getStatusBadge(res.reservationStatus)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/reservations/${res.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReservation(res.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReservations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400 py-6">
                        No reservations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
