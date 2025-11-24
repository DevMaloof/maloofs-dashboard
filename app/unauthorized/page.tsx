// /app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl text-center p-6 rounded-2xl shadow-lg bg-white">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 overflow-hidden">
            <img
              src="/logo.png"
              alt="Maloof’s Restaurant Logo"
              className="w-full h-full object-contain rounded-full shadow-sm"
            />
          </div>
        </div>



        <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-red-700">
          Access Denied
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 px-2">
          You don’t have permission to view this page.
          <br className="hidden sm:block" />
          Please contact your admin if you believe this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Go to Login
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
