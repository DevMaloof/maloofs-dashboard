// app/menumanagement/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type MenuItem = {
  _id: string;
  name: string;
  category: "desserts" | "drinks" | "maincourse" | "starters";
  price: number;
  availability: boolean;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string; // added
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MenuManagementPage() {
  const { data, error, isLoading } = useSWR<MenuItem[]>("/api/menu", fetcher, {
    refreshInterval: 5000,
  });

  const items = data || [];
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MenuItem["category"]>("desserts");
  const [price, setPrice] = useState<number>(0);
  const [availability, setAvailability] = useState<boolean>(true);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill edit
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCategory(editing.category);
      setPrice(editing.price);
      setAvailability(!!editing.availability);
      setDescription(editing.description || "");
      setImageFile(null);
      setOpen(true);
    }
  }, [editing]);

  const clearForm = () => {
    setName("");
    setCategory("desserts");
    setPrice(0);
    setAvailability(true);
    setDescription("");
    setImageFile(null);
    setEditing(null);
  };

  const handleOpenAdd = () => {
    clearForm();
    setOpen(true);
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return { url: data.url, publicId: data.public_id };
  };

  const handleSubmit = async () => {
    if (!name || !category || typeof price === "undefined") {
      toast.error("Please fill name, category and price.");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare form data for upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price.toString());
      formData.append("availability", availability.toString());
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);
      if (editing?._id) formData.append("id", editing._id); // for PUT

      const res = await fetch(editing ? `/api/menu` : `/api/menu`, {
        method: editing ? "PUT" : "POST",
        body: formData, // ✅ No headers! Let browser set multipart/form-data
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Operation failed" }));
        throw new Error(err?.error || "Operation failed");
      }

      toast.success(editing ? "Menu item updated" : "Menu item added");
      mutate("/api/menu");
      clearForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };


  const deleteItem = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      mutate("/api/menu");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Delete failed");
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: !current }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Updated availability");
      mutate("/api/menu");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Update failed");
    }
  };

  const filtered = items
    .filter((i) =>
      [i.name, i.description || ""].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((i) =>
      categoryFilter === "all" ? true : i.category === categoryFilter
    );

  return (
    <div className="p-6">
      <Card className="shadow-lg bg-gray-900">
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-50">Menu Management</h1>

            <div className="flex items-center gap-3">
              <Input
                placeholder="Search name or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-white md:w-64"
              />

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-white md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="maincourse">Main Course</SelectItem>
                  <SelectItem value="starters">Starters</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-gray-700" onClick={handleOpenAdd}>Add Item</Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading menu items...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-6">
              Failed to load menu items.
            </div>
          )}

          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-50 font-bold">Name</TableHead>
                    <TableHead className="text-gray-50 font-bold">Category</TableHead>
                    <TableHead className="text-gray-50 font-bold">Price</TableHead>
                    <TableHead className="text-gray-50 font-bold">Availability</TableHead>
                    <TableHead className="text-gray-50 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-white">{item.name}</TableCell>
                      <TableCell className="text-white capitalize">{item.category}</TableCell>
                      <TableCell className="text-white">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.availability ? (
                          <Badge className="bg-green-600">Available</Badge>
                        ) : (
                          <Badge className="bg-red-600">Unavailable</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item._id)}>
                          Delete
                        </Button>
                        <Button className="bg-gray-700" size="sm" onClick={() => toggleAvailability(item._id, item.availability)}>
                          {item.availability ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                        No menu items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) clearForm(); }}>
        <DialogContent className="bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold">{editing ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <Input className="text-gray-100 placeholder:text-gray-100" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={category} onValueChange={(v) => setCategory(v as MenuItem["category"])}>
              <SelectTrigger className="text-gray-100">
                <SelectValue className="text-gray-100" placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="drinks">Drinks</SelectItem>
                <SelectItem value="maincourse">Main Course</SelectItem>
                <SelectItem value="starters">Starters</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Price"
              className="text-gray-100 placeholder:text-gray-100"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="text-sm text-gray-300">Availability</label>
                <span className="text-xs text-gray-400">Toggle if item is available</span>
              </div>
              <Switch checked={availability} onCheckedChange={setAvailability} />

            </div>

            <Input
              className="text-gray-100 placeholder:text-gray-100"
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div>
              <label className="text-sm text-gray-300">Image (.webp only)</label>
              <input
                type="file"
                accept=".webp"
                onChange={(e) => {
                  const f = e.target.files ? e.target.files[0] : null;
                  setImageFile(f);
                }}
                className="mt-2 text-sm text-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload .webp image (optional). Uploading a new file replaces the old one.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => { setOpen(false); clearForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gray-600" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
