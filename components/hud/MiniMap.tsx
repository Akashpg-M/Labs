"use client";

import React from "react";
import { GAME_CONFIG, STATIONS } from "@/lib/game-config";

interface MiniMapProps {
  playerPos: { x: number; y: number };
}

export default function MiniMap({ playerPos }: MiniMapProps) {
  // 1. Calculate the Scale Factor
  // We want the MiniMap to be fixed width (e.g., 240px)
  const MINI_WIDTH = 240;
  const scale = MINI_WIDTH / GAME_CONFIG.mapWidth;
  const MINI_HEIGHT = GAME_CONFIG.mapHeight * scale;

  return (
    <div 
      className="absolute bottom-6 right-6 z-50 bg-black/80 border-2 border-slate-600 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm"
      style={{ width: MINI_WIDTH, height: MINI_HEIGHT }}
    >
      {/* MAP TITLE */}
      <div className="absolute top-0 left-0 bg-slate-800/80 text-[8px] text-white px-1.5 py-0.5 rounded-br">
        SECTOR MAP
      </div>

      {/* 2. RENDER STATIC STATIONS (The dots) */}
      {STATIONS.map((station) => (
       <div
  key={station.id}
  className="absolute w-1.5 h-1.5 rounded-full"
  style={{
    left: station.x * scale,
    top: station.y * scale,
    // Fix: Fallback to gray string if color is missing
    backgroundColor: (station.color || "").includes('red') ? '#ef4444' : 
                     (station.color || "").includes('blue') ? '#3b82f6' : 
                     (station.color || "").includes('yellow') ? '#eab308' : '#22c55e'
  }}
/>
      ))}

      {/* 3. RENDER THE PLAYER (Blinking Dot) */}
      <div
        className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white shadow-[0_0_8px_rgba(250,204,21,0.8)] z-10"
        style={{
          left: playerPos.x * scale - 1.25, // Centered
          top: playerPos.y * scale - 1.25,
        }}
      />

      {/* 4. RENDER THE CAMERA VIEWPORT (The Box showing what you see) */}
      <div 
        className="absolute border border-white/30 bg-white/5 pointer-events-none"
        style={{
          width: GAME_CONFIG.viewportWidth * scale,
          height: GAME_CONFIG.viewportHeight * scale,
          left: (playerPos.x - GAME_CONFIG.viewportWidth / 2) * scale,
          top: (playerPos.y - GAME_CONFIG.viewportHeight / 2) * scale,
        }}
      />
    </div>
  );
}