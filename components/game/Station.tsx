"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { GameStation } from "@/lib/game-config";

interface StationProps {
  station: GameStation;
  isActive: boolean;
}

export default function Station({ station, isActive }: StationProps) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center transition-all duration-200"
      style={{
        left: station.x - 40, // Centering offset (half of width)
        top: station.y - 40,
        zIndex: station.y // Y-Sorting (things lower on screen cover things higher)
      }}
    >
      {/* Interaction Prompt (Bouncing Badge) */}
      <div className={`
          absolute -top-12 z-50 transition-all duration-300
          ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}>
        <Badge className="bg-yellow-400 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
          PRESS ENTER
        </Badge>
      </div>

      {/* The Visual Object */}
      <div className={`
        w-20 h-20 rounded-lg shadow-xl border-2 border-black flex items-center justify-center transition-all
        ${station.color} 
        ${isActive ? 'scale-110 ring-4 ring-white brightness-110' : 'opacity-90'}
      `}>
        <station.icon className="text-white w-8 h-8 drop-shadow-md" />
      </div>

      {/* Label */}
      <span className="mt-2 text-[10px] font-bold text-slate-200 bg-black/80 px-2 py-1 rounded border border-white/10">
        {station.label}
      </span>
    </div>
  );
}