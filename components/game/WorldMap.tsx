// "use client";

// import React from "react";
// import { GAME_CONFIG } from "@/lib/game-config";

// export default function WorldMap() {
//   return (
//     <div 
//       className="absolute inset-0 bg-slate-950"
//       style={{ width: GAME_CONFIG.mapWidth, height: GAME_CONFIG.mapHeight }}
//     >
      
//       {/* 1. BASE GRID PATTERN (The "Tron" Floor) */}
//       <div className="absolute inset-0 opacity-20" 
//            style={{ 
//              backgroundImage: `radial-gradient(circle, #64748b 2px, transparent 2px)`, 
//              backgroundSize: '40px 40px' 
//            }} 
//       />

//       {/* 2. ZONES & ROOMS (Visual Cues) */}
      
//       {/* SERVER ROOM (Red Zone) */}
//       <div className="absolute top-[200px] left-[1800px] w-[500px] h-[400px] bg-red-900/10 border-4 border-slate-800 rounded-3xl">
//          <div className="absolute -top-10 left-0 text-red-500/30 font-black text-6xl tracking-tighter select-none">
//            SERVER_FARM
//          </div>
//          {/* Decorative blinking light */}
//          <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
//       </div>

//       {/* EXAM HALL (Blue Zone) */}
//       <div className="absolute top-[300px] left-[300px] w-[600px] h-[500px] bg-blue-900/10 border-4 border-slate-800 rounded-3xl">
//          <div className="absolute -top-10 right-0 text-blue-500/30 font-black text-6xl tracking-tighter select-none">
//            EXAM_HALL
//          </div>
//          <div className="absolute bottom-4 left-4 text-xs text-blue-400/50 font-mono">
//            SILENCE REQUIRED • SECTOR A
//          </div>
//       </div>

//       {/* CAFETERIA (Green Zone) */}
//       <div className="absolute top-[700px] left-[1100px] w-[400px] h-[400px] bg-green-900/10 border-4 border-slate-800 rounded-full">
//          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500/20 font-black text-4xl tracking-widest select-none rotate-45">
//            LOUNGE
//          </div>
//       </div>

//       {/* 3. WALLS / BORDERS */}
//       <div className="absolute top-0 left-0 w-full h-2 bg-slate-800" />
//       <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800" />
//       <div className="absolute top-0 left-0 h-full w-2 bg-slate-800" />
//       <div className="absolute top-0 right-0 h-full w-2 bg-slate-800" />

//     </div>
//   );
// }
"use client";

import React from "react";
import Image from "next/image"; 
import { GAME_CONFIG } from "@/lib/game-config";

export default function WorldMap() {
  return (
    <div 
      className="absolute inset-0 bg-slate-950"
      style={{ width: GAME_CONFIG.mapWidth, height: GAME_CONFIG.mapHeight }}
    >
      {/* 1. THE PIXEL ART MAP */}
      {/* The 'pixelated' class ensures it stays sharp and doesn't get blurry */}
      <Image 
        src="/maps/lab-map-final2.jpeg" 
        alt="NetVerse Campus"
        fill
        className="object-cover pixelated" 
        priority
      />

      {/* 2. OPTIONAL: VISUAL DEBUGGER */}
      {/* These colored boxes show where the CODE thinks the zones are. */}
      {/* If your drawing doesn't match these boxes, adjust coordinates in game-config.ts */}
      {/* Once everything aligns, you can delete this entire div. */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {/* Exam Hall Area Check */}
        <div className="absolute top-[640px] left-[640px] w-20 h-20 border-4 border-blue-500" />
        
        {/* Server Farm Area Check */}
        <div className="absolute top-[480px] left-[2240px] w-20 h-20 border-4 border-red-500" />
        
        {/* Cafeteria Area Check */}
        <div className="absolute top-[1280px] left-[1184px] w-20 h-20 border-4 border-green-500" />
      </div>
    </div>
  );
}