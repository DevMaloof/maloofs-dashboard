// /app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert, Lock, ArrowLeft, Home, AlertTriangle,
  Shield, AlertCircle, XCircle, LogIn
} from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <div className="relative">
          {/* Background effects */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

          {/* Main card */}
          <div className="relative border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-full blur-lg opacity-50" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center">
                  <ShieldAlert className="h-12 w-12 text-white" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Access Restricted
              </h1>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-300 font-medium">Unauthorized Access</span>
              </div>

              <p className="text-gray-300 text-lg mb-2">
                You don't have permission to access this page.
              </p>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                This area is restricted to authorized staff members only. Please contact your administrator if you believe this is an error.
              </p>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Lock className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Security Level</p>
                    <p className="font-semibold text-white">Restricted</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Access Required</p>
                    <p className="font-semibold text-white">Staff Credentials</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Authentication</p>
                    <p className="font-semibold text-white">Role-Based</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/login" className="block">
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <div className="flex items-center justify-center gap-3">
                    <LogIn className="h-5 w-5" />
                    <span>Staff Login</span>
                  </div>
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Home className="h-5 w-5" />
                    <span>Return Home</span>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Additional info */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500">Need help?</p>
                  <p className="text-sm text-blue-400 font-medium">
                    Contact: admin@maloofs.com
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Secure connection • 256-bit encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Unauthorized access attempts are logged for security purposes.
            <br />
            For assistance, please contact your system administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
}