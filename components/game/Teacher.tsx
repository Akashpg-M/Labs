import React from "react";
import { motion } from "framer-motion";

interface TeacherProps {
  x: number;
  y: number;
  label: string;
  status?: "online" | "available" | "offline";
}

// ⚠️ IMPORTANT: Must be 'export default'
export default function Teacher({ x, y, label, status = "offline" }: TeacherProps) {
  const statusColors: Record<string, string> = {
    online: "bg-blue-500 shadow-blue-500/50",
    available: "bg-green-500 shadow-green-500/50",
    offline: "bg-zinc-500 shadow-zinc-500/50",
  };

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center z-10 w-16 h-16 -ml-4 -mt-8"
      initial={{ x, y }}
      animate={{ y: [y, y - 4, y] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
    >
      <div className={`absolute -top-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md`}>
        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${statusColors[status] || statusColors.offline} animate-pulse`} />
        <span className="text-[8px] text-white font-bold uppercase tracking-wide">
          {status === 'available' ? "Accepting Doubts" : status}
        </span>
      </div>

      <img 
        src="/characters/teacher.png" 
        alt="Professor"
        className="w-full h-full object-contain pixelated drop-shadow-md" 
        onError={(e) => { e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Professor&clothing=blazerAndShirt"; }}
      />

      <div className="absolute -top-4 bg-yellow-600/90 border border-yellow-400 px-2 py-0.5 rounded text-[10px] text-white font-bold whitespace-nowrap shadow-lg z-20">
        {label}
      </div>
    </motion.div>
  );
}