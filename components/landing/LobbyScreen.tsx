"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "../providers/AuthProvider";

export default function LobbyScreen({ onJoin }: { onJoin: (name: string, role: string) => void }) {
  const [name, setName] = useState("");
  const { user, signInWithGoogle, logout } = useAuth(); // <--- Magic Hook
useEffect(() => {
    if (user) {
      // Wait 1.5 seconds for the "Identity Verified" animation to play, then join
      const timer = setTimeout(() => {
        onJoin(user.displayName || "Student", "student");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, onJoin]);
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-8 z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            NETVERSE <span className="text-blue-500">LABS</span>
          </h1>
          <p className="text-zinc-400">The Spatial Operating System for Engineering</p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-6 flex items-center gap-3"
            onClick={signInWithGoogle}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-500">Or guest access</span></div>
          </div>

          <Input 
            placeholder="Enter Guest Name" 
            className="bg-black border-zinc-700 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => onJoin(name || "Guest", "student")}
          >
            Enter Campus
          </Button>
        </div>
      </Card>
    </div>
  );
}