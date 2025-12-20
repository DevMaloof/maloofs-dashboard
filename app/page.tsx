// /app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar, Clock, CheckCircle, TrendingUp,
  Star, BarChart3, CalendarRange,
  ChefHat
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type RangeKey = "today" | "week" | "month" | "quarter" | "year";

interface StatsResponse {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  revenue: number;
  avgPartySize: number;
}

interface TrendPoint {
  date: string;
  count: number;
  revenue: number;
}

const RANGES: { key: RangeKey; label: string; icon: React.ReactNode }[] = [
  { key: "today", label: "Today", icon: <Calendar className="h-4 w-4" /> },
  { key: "week", label: "This Week", icon: <CalendarRange className="h-4 w-4" /> },
  { key: "month", label: "This Month", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "quarter", label: "Quarter", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "year", label: "Year", icon: <ChefHat className="h-4 w-4" /> },
];

function StatCard({
  title,
  value,
  icon,
  change,
  loading,
  color = "blue",
  format = "number"
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: string;
  loading: boolean;
  color?: "blue" | "green" | "purple" | "amber";
  format?: "number" | "currency" | "time";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30"
  };

  const formatValue = (val: number) => {
    const safeVal = val ?? 0;

    if (format === "currency") return `$${safeVal.toLocaleString()}`;
    if (format === "time") return `${safeVal} min`;
    return safeVal.toLocaleString();
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border overflow-hidden group hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-white mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white mb-2">
              {loading ? <Skeleton className="h-9 w-24 bg-gray-700" /> : formatValue(value)}
            </h3>
            {change && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SparklineChart({ data }: { data: TrendPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px]">
      <div className="absolute inset-0">
        {/* Simplified sparkline visualization */}
        <div className="flex items-end h-full gap-2 px-4">
          {data.map((point, i) => {
            const height = (point.count / Math.max(...data.map(d => d.count))) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:to-blue-300"
                  style={{ height: `${Math.max(20, height)}%` }}
                />
                {i % 2 === 0 && (
                  <span className="text-xs text-gray-500 mt-3">{point.date.slice(5)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecentReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews/recent", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="h-[400px] space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32 bg-gray-700" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-400">No reviews yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
      {reviews.slice(0, 8).map((review, index) => (
        <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-white truncate">{review.name}</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 italic">"{review.comment}"</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StaffDashboard() {
  const [range, setRange] = useState<RangeKey>("week");
  const [stats, setStats] = useState<StatsResponse>({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    avgPartySize: 0
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedRangeLabel = useMemo(() => RANGES.find((r) => r.key === range)?.label || "Week", [range]);

  useEffect(() => {
    let ignore = false;

    async function fetchStats() {
      setLoadingStats(true);
      setError(null);
      try {
        const res = await fetch(`/api/reservations/stats?range=${range}&_=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data: StatsResponse = await res.json();
        if (!ignore) setStats(data);
      } catch (err: any) {
        console.error(err);
        if (!ignore) setError(err.message || "Failed to load stats");
      } finally {
        if (!ignore) setLoadingStats(false);
      }
    }

    async function fetchTrend() {
      setLoadingTrend(true);
      try {
        const res = await fetch(`/api/reservations/trend?range=${range}&_=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch trend");
        const data: TrendPoint[] = await res.json();
        if (!ignore) setTrend(data);
      } catch (err) {
        console.error(err);
        if (!ignore) setTrend([]);
      } finally {
        if (!ignore) setLoadingTrend(false);
      }
    }

    fetchStats();
    fetchTrend();

    return () => { ignore = true; };
  }, [range]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
              <p className="text-gray-400 text-sm">Restaurant management overview</p>
            </div>

            <div className="flex items-center gap-2">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${range === r.key
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  {r.icon}
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid - Now 3 cards only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Reservations"
            value={stats.total}
            icon={<Calendar className="h-6 w-6 text-blue-400" />}
            loading={loadingStats}
            color="blue"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending}
            icon={<Clock className="h-6 w-6 text-amber-400" />}
            loading={loadingStats}
            color="amber"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="h-6 w-6 text-emerald-400" />}
            loading={loadingStats}
            color="green"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trend Chart (2/3 width) with increased height */}
          <div className="lg:col-span-2">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white font-bold">Reservations Trend</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-400">Reservations</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                {loadingTrend ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent" />
                  </div>
                ) : (
                  <SparklineChart data={trend} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Reviews (1/3 width) with increased height */}
          <div className="lg:col-span-1">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-white font-bold">Recent Reviews</CardTitle>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                  {trend.length > 0 ? trend[trend.length - 1]?.count : 0} this week
                </Badge>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                <RecentReviews />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}