// app/menumanagement/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2, Search, Plus, Edit2, Trash2, Eye, EyeOff,
  Filter, Upload, DollarSign, Tag, Image as ImageIcon,
  Utensils, Coffee, Dessert, Pizza, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type MenuItem = {
  _id: string;
  name: string;
  category: "desserts" | "drinks" | "maincourse" | "starters";
  price: number;
  availability: boolean;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt?: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

function CategoryIcon({ category }: { category: MenuItem["category"] }) {
  const icons = {
    desserts: <Dessert className="h-4 w-4" />,
    drinks: <Coffee className="h-4 w-4" />,
    maincourse: <Utensils className="h-4 w-4" />,
    starters: <Pizza className="h-4 w-4" />
  };

  const colors = {
    desserts: "bg-pink-500/20 text-pink-400",
    drinks: "bg-blue-500/20 text-blue-400",
    maincourse: "bg-amber-500/20 text-amber-400",
    starters: "bg-emerald-500/20 text-emerald-400"
  };

  return (
    <div className={`p-2 rounded-lg ${colors[category]}`}>
      {icons[category]}
    </div>
  );
}

export default function MenuManagementPage() {
  const { data, error, isLoading } = useSWR<MenuItem[]>("/api/menu", fetcher, {
    refreshInterval: 3000,
  });

  const items = data || [];
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MenuItem["category"]>("desserts");
  const [price, setPrice] = useState<number>(0);
  const [availability, setAvailability] = useState<boolean>(true);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter items
  const filtered = items
    .filter((i) =>
      [i.name, i.description || ""].some((f) =>
        f.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((i) =>
      categoryFilter === "all" ? true : i.category === categoryFilter
    )
    .filter((i) => {
      if (availabilityFilter === "all") return true;
      if (availabilityFilter === "available") return i.availability;
      return !i.availability;
    });

  // Prefill edit
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCategory(editing.category);
      setPrice(editing.price);
      setAvailability(!!editing.availability);
      setDescription(editing.description || "");
      setImagePreview(editing.imageUrl || null);
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
    setImagePreview(null);
    setEditing(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !category || price <= 0) {
      toast.error("Please fill all required fields with valid values.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price.toString());
      formData.append("availability", availability.toString());
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);
      if (editing?._id) formData.append("id", editing._id);

      const res = await fetch(editing ? `/api/menu` : `/api/menu`, {
        method: editing ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Operation failed" }));
        throw new Error(err?.error || "Operation failed");
      }

      toast.success(editing ? "Menu item updated successfully" : "Menu item added successfully");
      mutate("/api/menu");
      clearForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Menu item deleted successfully");
      mutate("/api/menu");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete item");
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
      toast.success(`Item marked as ${!current ? "available" : "unavailable"}`);
      mutate("/api/menu");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Menu Management</h1>
              <p className="text-gray-300 text-sm">Manage your restaurant's menu items</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {items.length} total items
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Control Panel */}
        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="starters">Starters</SelectItem>
                  <SelectItem value="maincourse">Main Course</SelectItem>
                  <SelectItem value="desserts">Desserts</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="unavailable">Unavailable Only</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => { clearForm(); setOpen(true); }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-700/50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Items</p>
                  <p className="text-2xl font-bold text-white">{items.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Tag className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700/50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Now</p>
                  <p className="text-2xl font-bold text-white">
                    {items.filter(i => i.availability).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Eye className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700/50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Unavailable</p>
                  <p className="text-2xl font-bold text-white">
                    {items.filter(i => !i.availability).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <EyeOff className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg. Price</p>
                  <p className="text-2xl font-bold text-white">
                    ${(items.reduce((sum, i) => sum + i.price, 0) / items.length || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <DollarSign className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items Table */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-300 font-semibold">Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-gray-400">Loading menu items...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Failed to load menu items</p>
                <Button
                  variant="outline"
                  onClick={() => mutate("/api/menu")}
                  className="border-gray-700 text-gray-300"
                >
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Utensils className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No menu items found</p>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your filters or add a new item
                </p>
                <Button
                  onClick={() => { clearForm(); setOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-300 font-semibold">Item</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Category</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Price</TableHead>
                      <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item._id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-white">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon category={item.category} />
                            <span className="capitalize text-gray-300">{item.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-amber-400" />
                            <span className="font-semibold text-white">${item.price.toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${item.availability ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                          >
                            {item.availability ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditing(item)}
                              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAvailability(item._id, item.availability)}
                              className={`h-8 px-2 ${item.availability ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'} hover:bg-gray-800`}
                            >
                              {item.availability ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteItem(item._id)}
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
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) clearForm(); }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-white">
              {editing ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editing ? 'Update the details below' : 'Fill in the details for the new menu item'}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="px-6 flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Item Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="e.g., Texas Smoked Brisket"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Select value={category} onValueChange={(v: MenuItem["category"]) => setCategory(v)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="starters">Starters</SelectItem>
                      <SelectItem value="maincourse">Main Course</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">Price ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="pl-9 bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Brief description of the item..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="availability" className="text-gray-300">Availability</Label>
                  <Switch
                    id="availability"
                    checked={availability}
                    onCheckedChange={setAvailability}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Toggle to make this item available for ordering
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-300">Item Image</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <Upload className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <p className="text-sm text-gray-400 mb-2">Upload .webp image</p>
                      <p className="text-xs text-gray-500 mb-4">Recommended: 500×500px</p>
                      <Input
                        id="image"
                        type="file"
                        accept=".webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image')?.click()}
                        className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-gray-800 bg-gray-900 flex-shrink-0 mt-auto">
            <Button
              variant="ghost"
              onClick={() => { setOpen(false); clearForm(); }}
              className="border-0 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !name || !category || price <= 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editing ? 'Update Item' : 'Add Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}