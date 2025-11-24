// /app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SquareMenu, Clock, CheckCheck } from "lucide-react";

type RangeKey = "today" | "week" | "month" | "all";

interface StatsResponse {
  total: number;
  pending: number;
  completed: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

// Helper to get today UTC string
function todayUTC() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function Sparkline({ data }: { data: TrendPoint[] }) {
  const width = 700;
  const height = 160;
  const padding = 12;

  if (!data || data.length === 0) {
    return <div className="text-gray-400 italic text-sm">No trend data available</div>;
  }

  const counts = data.map((d) => d.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const vRange = max === min ? max || 1 : max - min;
  const step = (width - padding * 2) / Math.max(1, data.length - 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * step;
      const y = padding + (height - padding * 2) * (1 - (d.count - min) / vRange);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = (() => {
    const top = data
      .map((d, i) => {
        const x = padding + i * step;
        const y = padding + (height - padding * 2) * (1 - (d.count - min) / vRange);
        return `${x},${y}`;
      })
      .join(" ");
    const lastX = padding + (data.length - 1) * step;
    return `M ${padding},${height - padding} L ${top} L ${lastX},${height - padding} Z`;
  })();

  const firstLabel = data[0]?.date;
  const lastLabel = data[data.length - 1]?.date;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <defs>
          <linearGradient id="sparkline-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkline-grad)" />
        <polyline
          fill="none"
          stroke="#60a5fa"
          strokeWidth={2.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {data.map((d, i) => {
          const x = padding + i * step;
          const y = padding + (height - padding * 2) * (1 - (d.count - min) / vRange);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === data.length - 1 ? 3.2 : 2.2}
              fill={i === data.length - 1 ? "#60a5fa" : "#1f2937"}
              stroke="#60a5fa"
              strokeWidth={0.6}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
        <div className={firstLabel === todayUTC() ? "font-bold" : ""}>{firstLabel}</div>
        <div className={lastLabel === todayUTC() ? "font-bold" : ""}>{lastLabel}</div>
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

  if (loading) return <div className="text-gray-400 text-center mt-8">Loading reviews...</div>;
  if (!reviews || reviews.length === 0) return <div className="text-gray-400 text-center mt-8">No reviews yet</div>;

  return (
    <div className="divide-y divide-gray-800">
      {reviews.map((r, i) => (
        <div key={i} className="p-3 flex flex-col bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-50">{r.name}</p>
            <p className="text-yellow-400 text-sm">
              {"⭐".repeat(r.rating)} <span className="text-gray-100 text-xs ml-1">({r.rating}/5)</span>
            </p>
          </div>
          <p className="text-gray-200 font-medium italic text-sm mt-1">{r.comment}</p>
          <p className="text-xs text-gray-300 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [range, setRange] = useState<RangeKey>("week");
  const [stats, setStats] = useState<StatsResponse>({ total: 0, pending: 0, completed: 0 });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedRangeLabel = useMemo(() => RANGES.find((r) => r.key === range)?.label || "Range", [range]);

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
    <div className="min-h-screen w-full bg-gray-950 text-white grid gap-6 px-4 py-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min">
      {/* Header */}
      <div className="sm:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-semibold">Dashboard</div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`text-sm px-3 py-1 rounded-md transition ${range === r.key ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Card className="relative h-44 w-full bg-gray-900 text-white font-bold border-0">
        <div className="absolute top-4 right-4"><SquareMenu size={28} color="#f3f4f6" /></div>
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-5xl text-gray-100 font-extrabold">{loadingStats ? "…" : stats.total}</div>
          <div className="text-xl text-gray-100 font-medium mt-2">Total Reservations</div>
          <div className="text-sm text-gray-400 mt-2">{selectedRangeLabel}</div>
        </div>
      </Card>

      <Card className="relative h-44 w-full bg-gray-900 text-white font-bold border-0">
        <div className="absolute top-4 right-4"><Clock size={28} color="#f3f4f6" /></div>
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-5xl text-gray-100 font-extrabold">{loadingStats ? "…" : stats.pending}</div>
          <div className="text-xl text-gray-100 font-medium mt-2">Pending Approvals</div>
          <div className="text-sm text-gray-400 mt-2">{selectedRangeLabel}</div>
        </div>
      </Card>

      <Card className="relative h-44 w-full bg-gray-900 text-white font-bold border-0">
        <div className="absolute top-4 right-4"><CheckCheck size={28} color="#f3f4f6" /></div>
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-5xl text-gray-100 font-extrabold">{loadingStats ? "…" : stats.completed}</div>
          <div className="text-xl text-gray-100 font-medium mt-2">Completed Reservations</div>
          <div className="text-sm text-gray-400 mt-2">{selectedRangeLabel}</div>
        </div>
      </Card>

      {/* Trend Graph */}
      <Card className="h-72 w-full bg-gray-900 text-white font-bold border-0 flex flex-col p-4 sm:col-span-2 lg:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Reservations Trend</div>
          <div className="text-sm text-gray-400">{loadingTrend ? "Loading..." : `${trend.length} points`}</div>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          {loadingTrend ? <div className="text-gray-400">Loading chart...</div> : trend.length === 0 ? <div className="text-gray-400">No trend data to show</div> : <Sparkline data={trend} />}
        </div>
      </Card>

      {/* Recent Reviews */}
      <Card className="block h-72 w-full bg-gray-900 text-white border-0 overflow-y-auto">
        <p className="text-3xl font-bold text-center py-4 border-b border-gray-800">Recent Reviews</p>
        <RecentReviews />
      </Card>

      {/* Error Toast */}
      {error && <div className="sm:col-span-2 lg:col-span-3"><div className="bg-red-800 text-white p-3 rounded-md">{error}</div></div>}
    </div>
  );
}
