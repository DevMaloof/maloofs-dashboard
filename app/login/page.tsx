// /app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react"; // 👈 eye icons

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // 👈 new state
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true); // 👈 start loading

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false); // 👈 stop loading on error
        } else {
            router.push("/"); // redirect after login
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md sm:max-w-lg space-y-4"
            >
                {/* Heading + subheading */}
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-50">Dashboard Login</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Sign in to manage your restaurant
                    </p>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-50">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md outline-0 text-gray-50 bg-gray-800"
                        required
                        disabled={loading} // 👈 disable input while loading
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-50">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md outline-0 text-gray-50 bg-gray-800 pr-10"
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={loading} // 👈 disable toggle during load
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading} // 👈 disable while processing
                    className={`w-full py-2 rounded-md transition ${
                        loading
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-gray-800 text-gray-50 hover:bg-gray-700"
                    }`}
                >
                    {loading ? "Redirecting..." : "Login"} {/* 👈 dynamic label */}
                </button>
            </form>
        </div>
    );
}
