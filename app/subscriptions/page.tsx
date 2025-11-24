// /app/subscriptions/page.tsx
"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");

  const { data: subscriptions = [], isLoading } = useSWR(
    "/api/subscriptions",
    fetcher,
    { refreshInterval: 5000 }
  );

  const filteredSubs = subscriptions.filter((sub: any) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    const res = await fetch("/api/subscriptions", {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      toast.error("Failed to delete subscriber ❌");
      return;
    }

    toast.success("Subscriber deleted successfully ✅");

    mutate("/api/subscriptions");
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Newsletter Subscriptions
        </h1>
        <p className="text-sm text-gray-400 mt-2 sm:mt-0">
          Manage users subscribed from Maloof’s website
        </p>
      </div>

      <div className="w-full sm:w-1/3">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 text-white border-gray-700"
        />
      </div>

      <Card className="bg-gray-900 border-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" />
            Subscribed Emails
          </CardTitle>
          <p className="text-sm text-gray-500">Total: {subscriptions.length}</p>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500 flex justify-center items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading subscribers...
            </div>
          ) : filteredSubs.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-2 px-4 font-medium">#</th>
                    <th className="py-2 px-4 font-medium">Email</th>
                    <th className="py-2 px-4 font-medium">Subscribed On</th>
                    <th className="py-2 px-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((sub: any, index: number) => (
                    <tr
                      key={sub._id}
                      className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                    >
                      <td className="py-2 px-4 text-gray-400">{index + 1}</td>
                      <td className="py-2 px-4 text-white">{sub.email}</td>
                      <td className="py-2 px-4 text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(sub._id)}
                          className="hover:bg-red-600/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">
              No subscriptions found yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
