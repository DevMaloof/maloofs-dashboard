// /app/reservations/page.tsx
"use client";

import useSWR, { mutate } from "swr";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
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
import {
  Search, Filter, Calendar, Users, Clock,
  MoreVertical, Download, RefreshCw,
  Eye, Trash2, Mail, Phone, Loader2, AlertCircle,
  CheckCircle, XCircle, CheckCheck, MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  specialRequests?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reservations");
  const data = await res.json();
  return data.reservations || [];
};

export default function ReservationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [activeTab, setActiveTab] = useState("all");

  const { data: reservations = [], error, isLoading, mutate: refreshData } = useSWR<Reservation[]>(
    "/api/reservations",
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r: Reservation) => r.reservationStatus === "pending").length;
    const confirmed = reservations.filter((r: Reservation) => r.reservationStatus === "confirmed").length;
    const cancelled = reservations.filter((r: Reservation) => r.reservationStatus === "cancelled").length;
    const completed = reservations.filter((r: Reservation) => r.reservationStatus === "completed").length;

    return { total, pending, confirmed, cancelled, completed };
  }, [reservations]);

  const deleteReservation = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the reservation for ${name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        refreshData();
        toast.success("Reservation deleted successfully");
      } else {
        toast.error("Failed to delete reservation");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting reservation");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    };

    const labels: Record<string, string> = {
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
      pending: "Pending"
    };

    return (
      <Badge variant="outline" className={variants[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-400" />;
      case "completed": return <CheckCheck className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter((res: Reservation) =>
      [res.name, res.email, res.phone].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    );

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((res: Reservation) => res.reservationStatus === activeTab);
    }

    // Apply additional status filter if needed
    if (statusFilter !== "all" && activeTab === "all") {
      filtered = filtered.filter((res: Reservation) => res.reservationStatus === statusFilter);
    }

    // Sort
    filtered.sort((a: Reservation, b: Reservation) => {
      if (sortBy === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "guests-desc")
        return b.guests - a.guests;
      if (sortBy === "guests-asc")
        return a.guests - b.guests;
      return 0;
    });

    return filtered;
  }, [reservations, search, activeTab, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("date-desc");
    setActiveTab("all");
  };
   

  const refreshReservations = () => {
    refreshData();
    toast.info("Refreshing reservations...");
  };

  const handleRetry = () => {
    refreshData();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Reservations</h1>
              <p className="text-gray-400 text-sm">Manage restaurant bookings and reservations</p>
            </div>
           
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Confirmed</p>
                  <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Cancelled</p>
                  <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <CheckCheck className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-gray-800">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-50 font-bold">Reservation Management</CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage all restaurant bookings
                </CardDescription>
              </div>

            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs & Filters */}
            <div className="mb-6 space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-700/50 text-gray-100">
                  <TabsTrigger value="all" className="text-gray-300 data-[state=active]:bg-gray-600">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-gray-200 data-[state=active]:bg-amber-600">
                    Pending ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="confirmed" className="text-gray-200 data-[state=active]:bg-emerald-600">
                    Confirmed ({stats.confirmed})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-gray-200 data-[state=active]:bg-red-600">
                    Cancelled ({stats.cancelled})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-gray-200 data-[state=active]:bg-blue-600">
                    Completed ({stats.completed})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search reservations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-gray-700 border-gray-700 text-white"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-0 text-white">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-700 border-0 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-0">
                    <SelectItem value="date-desc" className="bg-gray-600 text-white">Newest First</SelectItem>
                    <SelectItem value="date-asc" className="bg-gray-600 text-white">Oldest First</SelectItem>
                    <SelectItem value="guests-desc" className="bg-gray-600 text-white">Most Guests</SelectItem>
                    <SelectItem value="guests-asc" className="bg-gray-600 text-white">Fewest Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {filteredReservations.length} of {reservations.length} reservations
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-200 border-2 border-gray-400 hover:text-gray-500"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Loading & Error States */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-gray-700 rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-gray-400 mb-2">Failed to load reservations</p>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No reservations found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {search ? "Try adjusting your search or filters" : "No reservations have been made yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <Table>
                  <TableHeader className="bg-gray-700">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-300 font-semibold">Guest</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Contact</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Date & Time</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Guests</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((res: Reservation) => (
                      <TableRow
                        key={res.id}
                        className="border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                        onClick={() => router.push(`/reservations/${res.id}`)}
                      >
                        <TableCell>
                          <div className="font-medium text-white">{res.name}</div>
                          {res.specialRequests && (
                            <div className="text-xs text-gray-400 truncate max-w-[200px]">
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              Special request
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{res.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Phone className="h-3 w-3" />
                              <span>{res.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(res.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{res.time}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-white">{res.guests}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(res.reservationStatus)}
                            {getStatusBadge(res.reservationStatus)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/reservations/${res.id}`);
                              }}
                              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="bg-gray-800 border-gray-700 text-white w-48"
                                align="end"
                              >
                                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem onClick={() => window.location.href = `mailto:${res.email}`}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = `tel:${res.phone}`}>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call Guest
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteReservation(res.id, res.name);
                                  }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-800 pt-6">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-gray-400">
                Auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshReservations}
                className="text-white border-2 border-gray-300 hover:text-gray-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}