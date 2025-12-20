// /app/offers/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Send, Mail, Target, Users, Bell, BarChart3,
    AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OffersPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const [sendToAll, setSendToAll] = useState(true);
    const [includeDiscount, setIncludeDiscount] = useState(false);
    const [discountCode, setDiscountCode] = useState("");

    // Fetch subscriber count on mount
    useState(() => {
        fetch("/api/subscribers/count")
            .then(res => res.json())
            .then(data => setSubscriberCount(data.count))
            .catch(() => setSubscriberCount(0));
    });

    const handleSendOffer = async () => {
        if (!subject.trim()) {
            toast.warning("Please enter a subject for your offer.");
            return;
        }

        if (!message.trim()) {
            toast.warning("Please enter the offer message.");
            return;
        }

        if (includeDiscount && !discountCode.trim()) {
            toast.warning("Please enter a discount code.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/email/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    message,
                    sendToAll,
                    discountCode: includeDiscount ? discountCode : undefined
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Offer sent to {data.sent.toLocaleString()} subscribers!</span>
                    </div>,
                    { duration: 5000 }
                );

                // Reset form
                setSubject("");
                setMessage("");
                setDiscountCode("");

                // Show success animation
                setTimeout(() => {
                    toast.info("Emails are being processed and will arrive shortly.");
                }, 1000);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to send offer.");
            }
        } catch (err) {
            console.error("Error sending offer:", err);
            toast.error(
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Network error. Please check your connection and try again.</span>
                </div>
            );
        } finally {
            setLoading(false);
        }
    };

    const generateDiscountCode = () => {
        const code = `MAL${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setDiscountCode(code);
        setIncludeDiscount(true);
        toast.info(`Discount code generated: ${code}`);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
                            <p className="text-gray-300 text-sm">Send offers and promotions to subscribers</p>
                        </div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                            <Users className="h-3 w-3 mr-1" />
                            {subscriberCount !== null ? `${subscriberCount.toLocaleString()} subscribers` : "Loading..."}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-gray-800 bg-gray-900/50">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                                        <Send className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-white font-bold">Create New Campaign</CardTitle>
                                        <CardDescription className="text-gray-300">
                                            Craft and send promotional offers to your subscribers
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Tabs defaultValue="offer" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                                        <TabsTrigger value="offer" className="text-gray-300 data-[state=active]:bg-blue-600">
                                            <Bell className="h-4 w-4 mr-2" />
                                            Offer
                                        </TabsTrigger>
                                        <TabsTrigger value="announcement" className="text-gray-300 data-[state=active]:bg-purple-600">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Announcement
                                        </TabsTrigger>
                                        <TabsTrigger value="event" className="text-gray-300 data-[state=active]:bg-emerald-600">
                                            <Target className="h-4 w-4 mr-2" />
                                            Event
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="offer" className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-gray-300 flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email Subject *
                                            </Label>
                                            <Input
                                                id="subject"
                                                placeholder="e.g., Special 25% Off This Weekend!"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="bg-gray-800 border-gray-700 text-white h-12 text-lg"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Make it catchy! This is what subscribers will see first.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-gray-300">Offer Message *</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Write your promotional message here. You can use HTML tags for formatting..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="min-h-[200px] bg-gray-800 border-gray-700 text-white"
                                            />
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span>Supports HTML formatting</span>
                                                </div>
                                                <span>{message.length}/2000 characters</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="discount" className="text-gray-300">Include Discount Code</Label>
                                                    <p className="text-sm text-gray-500">Add a special discount for this campaign</p>
                                                </div>
                                                <Switch
                                                    id="discount"
                                                    checked={includeDiscount}
                                                    onCheckedChange={setIncludeDiscount}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>

                                            {includeDiscount && (
                                                <div className="space-y-2 pl-4 border-l-2 border-emerald-500/30">
                                                    <Label htmlFor="discountCode" className="text-gray-300">Discount Code</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="discountCode"
                                                            placeholder="e.g., SUMMER25"
                                                            value={discountCode}
                                                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                            className="bg-gray-800 border-gray-700 text-white font-mono"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={generateDiscountCode}
                                                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                        >
                                                            Generate
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="space-y-4 rounded-lg bg-gray-800/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <Target className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">Audience Selection</p>
                                                <p className="text-sm text-gray-400">Choose who receives this campaign</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={sendToAll}
                                            onCheckedChange={setSendToAll}
                                            className="data-[state=checked]:bg-blue-500"
                                        />
                                    </div>
                                    <div className="pl-12">
                                        <p className="text-sm text-gray-300">
                                            {sendToAll
                                                ? "This offer will be sent to all active subscribers."
                                                : "Only subscribers who have engaged recently will receive this offer."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-gray-800 pt-6">
                                <div className="w-full space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>This action cannot be undone</span>
                                        </div>
                                        <Button
                                            onClick={handleSendOffer}
                                            disabled={loading || !subject.trim() || !message.trim()}
                                            className="min-w-[180px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Sending Campaign...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Campaign
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right Column - Stats & Templates */}
                    <div className="space-y-6">                     

                        {/* Quick Templates */}
                        <Card className="border-gray-800 bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-white font-semibold">Quick Templates</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Start with a pre-made template
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                    onClick={() => {
                                        setSubject("Special Weekend Offer - 25% Off!");
                                        setMessage("Enjoy 25% off your entire bill this weekend at Maloof's! Valid Friday through Sunday. Book your table now...");
                                    }}
                                >
                                    Weekend Discount
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                    onClick={() => {
                                        setSubject("New Seasonal Menu Launch!");
                                        setMessage("We're excited to announce our new seasonal menu featuring fresh, local ingredients. Come taste the flavors of the season...");
                                    }}
                                >
                                    Menu Launch
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    onClick={() => {
                                        setSubject("Happy Hour Extended!");
                                        setMessage("Good news! We've extended our happy hour until 7 PM. Enjoy half-priced appetizers and discounted drinks...");
                                    }}
                                >
                                    Happy Hour Update
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                            <div className="flex items-start gap-3">
                                <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-white text-sm">Best Practices</p>
                                    <ul className="mt-2 space-y-1 text-xs text-blue-300">
                                        <li>• Send campaigns on Thursday evenings</li>
                                        <li>• Keep subject lines under 50 characters</li>
                                        <li>• Include clear call-to-action buttons</li>
                                        <li>• Test on mobile devices before sending</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}