// /app/subscriptions/page.tsx
"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Trash2, Search, Users, Download,
  Calendar, Filter, CheckCircle, AlertCircle, Copy,
  BarChart3, ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Subscriber = {
  _id: string;
  email: string;
  createdAt: string;
  status?: "active" | "unsubscribed" | "bounced";
  source?: string;
  lastEngagement?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch subscribers");
  const data = await res.json();
  return data || [];
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const subscribersPerPage = 20;

  const { data: subscribers = [], error, isLoading, mutate: refreshData } = useSWR<Subscriber[]>(
    "/api/subscriptions",
    fetcher,
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter(s => !s.status || s.status === "active").length;
    const unsubscribed = subscribers.filter(s => s.status === "unsubscribed").length;
    const bounced = subscribers.filter(s => s.status === "bounced").length;
    const today = subscribers.filter(s => {
      const date = new Date(s.createdAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length;

    return { total, active, unsubscribed, bounced, today };
  }, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    let filtered = subscribers.filter((sub: Subscriber) =>
      sub.email.toLowerCase().includes(search.toLowerCase())
    );

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub: Subscriber) => {
        if (statusFilter === "active") return !sub.status || sub.status === "active";
        return sub.status === statusFilter;
      });
    }

    // Sort
    filtered.sort((a: Subscriber, b: Subscriber) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "email-asc")
        return a.email.localeCompare(b.email);
      if (sortBy === "email-desc")
        return b.email.localeCompare(a.email);
      return 0;
    });

    return filtered;
  }, [subscribers, search, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * subscribersPerPage,
    currentPage * subscribersPerPage
  );

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the mailing list?`)) return;

    try {
      const res = await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete subscriber");

      refreshData();
      toast.success("Subscriber removed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subscriber");
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed Date", "Status", "Source"];
    const csvData = filteredSubscribers.map((sub: Subscriber) => [
      sub.email,
      new Date(sub.createdAt).toISOString().split('T')[0],
      sub.status || "active",
      sub.source || "website"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row: string[]) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Subscribers exported to CSV");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const refreshSubscribers = () => {
    refreshData();
    toast.info("Refreshing subscribers...");
  };

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, string> = {
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      unsubscribed: "bg-red-500/20 text-red-400 border-red-500/30",
      bounced: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    };

    const labels: Record<string, string> = {
      active: "Active",
      unsubscribed: "Unsubscribed",
      bounced: "Bounced"
    };

    const statusKey = status || "active";

    return (
      <Badge variant="outline" className={variants[statusKey] || "bg-gray-500/20 text-gray-400"}>
        {labels[statusKey] || "Active"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Newsletter Subscribers</h1>
                <p className="text-gray-300 text-sm">Manage your restaurant's mailing list</p>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              <Users className="h-3 w-3 mr-1" />
              {stats.total.toLocaleString()} subscribers
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-300 font-bold">Subscriber Management</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage your newsletter mailing list
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={exportToCSV}
                  className="border-0 bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshSubscribers}
                  className="border-0 bg-gray-700/50 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search subscribers by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="email-asc">Email A-Z</SelectItem>
                    <SelectItem value="email-desc">Email Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {paginatedSubscribers.length} of {filteredSubscribers.length} subscribers
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white"
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
                <p className="text-gray-400 mb-2">Failed to load subscribers</p>
                <Button
                  variant="outline"
                  onClick={() => refreshData()}
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No subscribers found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {search ? "Try adjusting your search or filters" : "No subscribers yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <Table>
                  <TableHeader className="bg-gray-800/50">
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-300 font-semibold w-12">#</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Email Address</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Subscribed On</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Source</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscribers.map((sub: Subscriber, index: number) => (
                      <TableRow key={sub._id} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell className="text-gray-400">
                          {(currentPage - 1) * subscribersPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Mail className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{sub.email}</p>
                              {sub.lastEngagement && (
                                <p className="text-xs text-gray-500">
                                  Last engaged: {new Date(sub.lastEngagement).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-300">{formatDate(sub.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sub.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-700 text-gray-400">
                            {sub.source || "Website"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(sub.email)}
                              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = `mailto:${sub.email}`}
                              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(sub._id, sub.email)}
                              className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} • {filteredSubscribers.length} subscribers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="border-gray-700 text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm bg-gray-800 rounded-md text-gray-300">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="border-gray-700 text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}