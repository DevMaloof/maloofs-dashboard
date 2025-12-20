// /app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, LogIn, Lock, Mail, ChefHat,
    UtensilsCrossed, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StaffLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid credentials. Please check your email and password.");
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                            <div className="relative p-3 rounded-xl bg-gray-900 border border-gray-800">
                                <UtensilsCrossed className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-white">Maloof's</h1>
                            <p className="text-sm text-gray-400">Staff Portal</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Secure access to restaurant management tools</p>
                </div>

                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-2">
                            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center text-white">
                            Staff Login
                        </CardTitle>
                        <CardDescription className="text-center text-gray-400">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                                    <AlertDescription className="text-red-300">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Staff Email
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-gray-800 border-gray-700 text-white h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="staff@maloofs.com"
                                        required
                                        disabled={loading}
                                    />
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
                                        disabled={loading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-700" />
                                        <span className="text-xs text-gray-500">Secure connection</span>
                                    </div>
                                   
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Authenticating...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <LogIn className="h-5 w-5" />
                                        Sign In to Dashboard
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                For security reasons, access is restricted to authorized staff only.
                            </p>
                        </div>
                        <div className="w-full border-t border-gray-800 pt-4">
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    <span>256-bit encryption</span>
                                </div>
                                <div className="h-3 w-px bg-gray-800" />
                                <div className="flex items-center gap-1">
                                    <ChefHat className="h-3 w-3" />
                                    <span>Staff Only</span>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-600">
                        If you encounter issues, contact your administrator or email{" "}
                        <span className="text-blue-400">it-support@maloofs.com</span>
                    </p>
                </div>
            </div>
        </div>
    );
}